// @flow
import type { MatchResult } from '../routing/types'
import { NoMatch } from '../errors'

/*
 * Helper function to ensure that the matched result is the length we expected from the pat segments.
 * If not, then we reduce over the `onError` hooks of each matched node until one resolved.
 * If no node can resolve, then the returned promise is rejected.
 */
export default async function assertUrlFullyMatched(url: string, path: MatchResult[]): Promise<void> {
  const lastMatch = path[path.length - 1]

  if (lastMatch.remaining === '' || lastMatch.remaining === '/') {
    return
  }

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

  // Handler will either bubble rejection until it resolves, or rejects.
  try {
    await handler
  } catch(err) {
    throw new NoMatch(url, path)
  }
}
