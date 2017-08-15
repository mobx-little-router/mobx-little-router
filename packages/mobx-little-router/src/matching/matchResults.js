// @flow
import type { MatchResult } from './types'
import { NoMatch } from '../errors'

export default async function matchResults(parts: string[], path: MatchResult[]) {
  if (parts.length === path.length) {
    // If length is same or less, than we're good
    return
  } else if (parts.length === path.length + 1 && parts[parts.length - 1] === '') {
    // If we mismatched on a missing index route, just ignore it.
    // e.g. ['a', 'b', ''] should match on parts ['a', 'b'] since index route is optional.
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
    throw new NoMatch(parts, path)
  }
}
