// @flow
import type { PathElement } from '../../model/types'
import { NoMatch } from '../../errors/index'
import maybeCallErrorHandler from './maybeCallErrorHandler'

/*
 * Helper function to ensure that the matched result is the length we expected from the pat segments.
 * If not, then we reduce over the `onError` hooks of each matched node until one resolved.
 * If no node can resolve, then the returned promise is rejected.
 */
export default async function assertUrlFullyMatched(
  url: string,
  path: PathElement<*, *>[]
): Promise<void> {
  const lastMatch = path[path.length - 1]

  if (lastMatch.remaining === '' || lastMatch.remaining === '/') {
    return
  }

  // Handler will either bubble rejection until it resolves, or rejects.
  try {
    await maybeCallErrorHandler(path)
  } catch (err) {
    throw new NoMatch(url)
  }
}
