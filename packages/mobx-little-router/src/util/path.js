// @flow

/*
 * Resolves paths similar to url.resolve in Node. Does not handle host, port, etc.
 */
export function resolve(from: string, to: string): string {
  if (to.startsWith('/')) {
    return to
  } else {
    const results = []
    const parts = from.split('/')

    parts.pop()
    parts.push(...to.split('/'))

    parts.forEach(part => {
      if (part === '..') {
        results.pop()
      } else if (results !== '' && results !== '.') {
        results.push(part)
      }
    })

    // Always end in slash since the Router normalizes the pathname this way.
    if (results[results.length - 1] !== '') {
      results.push('')
    }

    return results.join('/')
  }
}
