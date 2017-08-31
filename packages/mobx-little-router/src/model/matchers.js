// @flow
import UrlPattern from 'url-pattern'

export type MatchFn = (url: string) => {
  matched: boolean,
  params: null | Object,
  segment: string,
  remaining: string
}

export function partial(path: string): MatchFn {
  const normalized = path === '' ? '*' : `/${path}*`
  return createMatcher(new UrlPattern(normalized))
}

export function full(path: string): MatchFn {
  const normalized = path === '' ? '(/)' : `/${path}(/)`
  return createMatcher(new UrlPattern(normalized))
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
