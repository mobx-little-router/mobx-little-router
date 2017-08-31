// @flow
import type { Route } from '../types'
import shallowEqual from '../../util/shallowEqual'

export default function areRoutesEqual(a?: Route<*, *>, b?: Route<*, *>) {
  return !!(a && b) && a.key === b.key && shallowEqual(a.params, b.params)
}
