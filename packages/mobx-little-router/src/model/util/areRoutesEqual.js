// @flow
import type { Route } from '../types'

export default function areRoutesEqual(a: ?Route<*, *>, b: ?Route<*, *>) {
  return !!(a && b) && a.key === b.key && a.value === b.value
}
