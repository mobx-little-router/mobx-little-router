// @flow
import { extendObservable } from 'mobx'
import { findNode } from '../util/tree'
import type { PathElement, RouteStateTreeNode } from './types'
import findPathFromRoot from './util/findPathFromRoot'
import type { OnExhaustedFn } from './util/findPathFromRoot'

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

  async pathFromRoot(
    url: string,
    onExhausted: OnExhaustedFn
  ): Promise<PathElement<*, *>[]> {
    return await findPathFromRoot(this.root, url, onExhausted)
  }
}
