// @flow
import UrlPattern from 'url-pattern'

export type MatchFn = (url: string) => { matched: boolean, params: null | Object, remaining: string }

export function partial(path: string): MatchFn {
  const normalized = path === '' ? '*' : `/${path}*`
  const pattern = new UrlPattern(normalized)

  return (url: string) => {
    const result = pattern.match(url)
    if (result) {
      const { _, ...params } = result
      return {
        remaining: _, // Continue with unmatched URL segment.
        matched: true,
        params
      }
    } else {
      return {
        matched: false,
        params: null,
        remaining: url // Continue matching current URL.
      }
    }
  }
}

export function full(path: string): MatchFn {
  const normalized = path === '' ? '(/)' : `/${path}(/)`
  const pattern = new UrlPattern(normalized)

  return (url: string) => {
    const result = pattern.match(url)
    if (result) {
      const { _, ...params } = result
      return {
        remaining: _, // Continue with unmatched URL segment.
        matched: true,
        params
      }
    } else {
      return {
        matched: false,
        params: null,
        remaining: url // Continue matching current URL.
      }
    }
  }
}
