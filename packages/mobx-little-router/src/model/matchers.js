// @flow
import UrlPattern from 'url-pattern'

export type MatchFn = (url: string) => {
  matched: boolean,
  params: null | Object,
  segment: string,
  remaining: string
}

export function partial(path: string): MatchFn {
  path = normalize(path)
  return createMatcher(new UrlPattern(path === '/' ? '*' : `${path}*`))
}

export function full(path: string): MatchFn {
  path = normalize(path)
  return createMatcher(new UrlPattern(path === '/' ? '(/)' : `${path}(/)`))
}

function normalize(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

function createMatcher(pattern: UrlPattern) {
  return (url: string) => {
    const result = pattern.match(url)
    if (result) {
      const { _, ...params } = result
      return {
        matched: true,
        params,
        segment: pattern.stringify({ ...params, _: '' }),
        remaining: _
      }
    } else {
      return {
        matched: false,
        params: null,
        segment: '',
        remaining: url
      }
    }
  }
}
