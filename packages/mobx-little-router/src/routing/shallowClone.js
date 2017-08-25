// @flow
import type { RouteNode } from './types'
import { TreeNode } from '../util/tree'

// Creates a shallow clone of the route node and its values.
export default function shallowClone(a: RouteNode): RouteNode {
  return TreeNode({
    ...a.value
  }, a.children.slice())
}
