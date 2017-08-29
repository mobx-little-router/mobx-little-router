// @flow
import type { RouteNode } from './types'

export default function areRoutesEqual(a: RouteNode<*>, b: RouteNode<*>) {
  return a.value.key === b.value.key
}
