// @flow
import type { RouteNode } from '../types'
import shallowEqual from '../../util/shallowEqual'

export default function areRoutesEqual(a: RouteNode<*>, b: RouteNode<*>) {
  return a.value.key === b.value.key && shallowEqual(a.value.params, b.value.params)
}
