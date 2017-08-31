// @flow
import type { RouteStateTreeNode } from '../types'
import { TreeNode } from '../../util/tree'

// Creates a shallow clone of the route node and its values.
export default function shallowClone(a: RouteStateTreeNode<*, *>): RouteStateTreeNode<*, *> {
  return TreeNode({
    ...a.value
  }, a.children.slice())
}
