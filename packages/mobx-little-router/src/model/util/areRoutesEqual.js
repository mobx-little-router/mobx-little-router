// @flow
import type { Route } from '../types'

export default (...args: Array<?Route<*, *>>) => {
  const fn = (a: ?Route<*, *>, b: ?Route<*, *>) => {
    return a === b || (!!(a && b) && a.key === b.key)
  }

  // Support currying if only one argument in given
  if (args.length !== 2) {
    return (b: ?Route<*, *>) => fn(args[0], b)
  }

  return fn.apply(null, args)
}
