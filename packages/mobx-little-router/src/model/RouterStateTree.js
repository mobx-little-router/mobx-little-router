// @flow
import { extendObservable } from 'mobx'
import { findNode } from '../util/tree'
import type { PathElement, RouteStateTreeNode } from './types'
import findPathFromRoot from './util/findPathFromRoot'

export default class RouterStateTree {
  root: RouteStateTreeNode<*, *>

  constructor(root: RouteStateTreeNode<*, *>) {
    extendObservable(this, {
      root: root
    })
  }

  find(predicate: (x: RouteStateTreeNode<*, *>) => boolean) {
    return findNode(predicate, this.root)
  }

  pathFromRoot(
    url: string
  ): PathElement<*, *>[] {
    return findPathFromRoot(this.root, url)
  }

  pathFrom(
    node: RouteStateTreeNode<*, *>,
    url: string
  ): PathElement<*, *>[] {
    return findPathFromRoot(node, url)
  }
}
