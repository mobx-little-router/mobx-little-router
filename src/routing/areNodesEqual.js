// @flow
import type { RouteNode } from './types'

export default function areNodesEqual(a: RouteNode, b: RouteNode) {
  return a.value.key === b.value.key
}
