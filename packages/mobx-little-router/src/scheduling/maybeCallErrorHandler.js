// @flow
import type { MatchResult } from '../model/types'

/*
 * Tries to bubble error from bottom to top until either one node handles it, or else rejects.
 */
export default function maybeCallErrorHandler(path: MatchResult[]) {
  // Try to recover from error by bubbling the error from last matched no, to the first.
  let idx = path.length - 1
  // Default handler will reject with error.
  let handler = Promise.reject()
  while (idx >= 0) {
    const result = path[idx]
    const { node: { value } } = result

    const { onError } = value
    // Try to run onError handler, if it resolves then the entire path can recover.
    handler = typeof onError === 'function'
      ? handler.catch(() => onError(result.node))
      : handler
    idx--
  }

  return handler
}
