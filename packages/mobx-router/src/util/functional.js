// @flow
type Predicate<T> = (a: T, b: T) => boolean

export function differenceWith<T>(f: Predicate<T>, xs: T[], ys: T[]) {
  let out = []
  let idx = 0
  let firstLen = xs.length
  while (idx < firstLen) {
    if (!ys.some(y => f(y, xs[idx])) && !out.some(o => f(o, xs[idx]))) {
      out.push(xs[idx])
    }
    idx += 1
  }
  return out
}
