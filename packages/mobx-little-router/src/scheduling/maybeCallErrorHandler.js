// @flow
import type { MatchResult } from '../routing/types'

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
    const { node: { value: { hooks } } } = result
    // Reduce from handler until it resolves.
    handler = hooks.onError ? hooks.onError.reduce((acc, handler) => {
      return acc.catch(() => {
        return handler(result.node, result.params)
      })
    }, handler) : handler
    idx--
  }

  return handler
}
