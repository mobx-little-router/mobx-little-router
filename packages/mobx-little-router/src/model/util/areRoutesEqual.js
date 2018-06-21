// @flow
import type { Route } from '../types'
import { curryN } from 'ramda'

export default curryN(2, (a: ?Route<*, *>, b: ?Route<*, *>) => {
  return a === b || (!!(a && b) && a.key === b.key && a.value === b.value)
})
