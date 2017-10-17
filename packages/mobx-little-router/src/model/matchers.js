// @flow
import UrlPattern from 'url-pattern'

export type MatchFn = (current: string, full?: string) => {
  matched: boolean,
  params: null | Object,
  parentUrl: string,
  segment: string,
  remaining: string
}

export function partial(path: string): MatchFn {
  path = normalize(path)
  return tag('partial', createMatcher(new UrlPattern(path === '/' ? '*' : `${path}*`)))
}

export function full(path: string): MatchFn {
  path = normalize(path)
  return tag('full', createMatcher(new UrlPattern(path === '/' ? '(/)' : `${path}(/)`)))
}

export function any(path: string): MatchFn {
  return tag('any', (url: string) => {
    return {
      matched: true,
      params: null,
      parentUrl: '',
      segment: url,
      remaining: ''
    }
  })
}

function tag(t, f) {
  f.type = t
  return f
}

function normalize(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

function createMatcher(pattern: UrlPattern) {
  return (current: string, full?: string) => {
    const result = pattern.match(current)

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
        segment,
        remaining: _
      }
    } else {
      return {
        matched: false,
        params: null,
        parentUrl: '',
        segment: '',
        remaining: current
      }
    }
  }
}
