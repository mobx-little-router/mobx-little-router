// @flow
import type { PathElement } from '../../model/types'

export default function isUrlFullyMatched(
  url: string,
  path: PathElement<*, *>[]
): boolean {
  const lastMatch = path[path.length - 1]
  return lastMatch && lastMatch.remaining === '' || lastMatch.remaining === '/'
}
