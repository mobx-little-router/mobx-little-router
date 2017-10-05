/* @flow
 * Path utility functions.
 */

/*
 * Resolves paths similar to path.resolve in Node.
 */
export function resolve(from: string, ...xs: string[]): string {
  let curr = from.split('/')
  for (const x of xs) {
    const parts = x.split('/')
    // Reset to absolute path.
    if (parts[0] === '') {
      curr = []
    }
    for (const part of parts) {
      if (part === '..') {
        curr.pop()
      } else if (part === '.') {
        // nothing
      } else {
        curr.push(part)
      }
    }
  }
  return curr.join('/')
}
