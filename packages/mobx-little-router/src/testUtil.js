// @flow
import { curryN } from 'ramda'
import Maybe from 'data.maybe'
import { TreeNode } from './util/tree'

export const maybeGetChild = curryN(2, function<T>(node: TreeNode<T>, idx: number) {
  if (node.children.length > idx) {
    return Maybe.Just(node.children[idx])
  } else {
    return Maybe.Nothing()
  }
})
