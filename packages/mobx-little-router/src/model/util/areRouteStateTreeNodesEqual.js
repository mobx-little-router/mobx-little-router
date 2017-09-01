// @flow
import type { RouteStateTreeNode } from '../types'

export default function areRouteStateTreeNodesEqual(a?: RouteStateTreeNode<*, *>, b?: RouteStateTreeNode<*, *>) {
  return !!(a && b) && a.value.key === b.value.key
}
