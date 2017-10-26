// @flow
import UrlPattern from 'url-pattern'

export type Matcher = {
  type: string,
  match: MatchFn,
  stringify: (params: Object) => string
}

export type MatchFn = (current: string, full: ?string) => {
  matched: boolean,
  params: null | Object,
  parentUrl: string,
  segment: string,
  remaining: string
}

export function partial(path: string): Matcher {
  path = withLeadingSlash(path)
  const pattern = new UrlPattern(path === '/' ? '*' : `${path}/*`)
  return {
    type: 'partial',
    match: createMatcher(pattern),
    stringify: (params: Object) => {
      return withoutTrailingSlash(pattern.stringify({ _: '', ...params }))
    }
  }
}

export function full(path: string): Matcher {
  path = withLeadingSlash(path)
  const pattern = new UrlPattern(path === '/' ? '(/)' : `${path}(/)`)
  return {
    type: 'full',
    match: createMatcher(pattern),
    stringify: (params: Object) => pattern.stringify(params)
  }
}

export function any(path: string): Matcher {
  return {
    type: 'any',
    match: (url: string) => {
      return {
        matched: true,
        params: null,
        parentUrl: '',
        segment: url,
        remaining: ''
      }
    },
    stringify: (params: Object) => {
      throw new Error('Cannot stringify `any` URL')
    }
  }
}

function createMatcher(pattern: UrlPattern) {
  return (current: ?string, full: ?string) => {
    const result = pattern.match(typeof current ==='string' ? withTrailingSlash(current) : current)

    if (result) {
      const { _, ...params } = result
      const segment = pattern.stringify({ ...params, _: '' })
      const parentUrl = typeof full === 'string'
        ? full.replace(new RegExp(`${segment}${_ || ''}\/?$`), '')
        : ''
      const normalizedParams = pattern.names.reduce((acc, k) => {
        if (k !== '_') {
          acc[k] = params[k] || null
        }
        return acc
      }, {})

      return {
        matched: true,
        params: normalizedParams,
        parentUrl,
        segment: withoutTrailingSlash(segment),
        remaining: _ ? withLeadingSlash(_) : _
      }
    } else {
      return {
        matched: false,
        params: null,
        parentUrl: '',
        segment: '',
        remaining: current || ''
      }
    }
  }
}

function withLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

function withTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`
}

function withoutTrailingSlash(x: string) {
  const match = x.match(/(.*?)\/?$/)
  return match ? match[1] : x
}
