// @flow
import type { Route } from '../types'

export default function areRoutesEqual(a?: Route<*, *>, b?: Route<*, *>) {
  return a === b || (!!(a && b) && a.value === b.value)
}
