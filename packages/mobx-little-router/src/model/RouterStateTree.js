// @flow
import { extendObservable } from 'mobx'
import { findNode } from '../util/tree'
import type { MatchResult, RouteNode } from './types'
import findPathFromRoot from './util/findPathFromRoot'
import type { OnExhaustedFn } from './util/findPathFromRoot'

export default class RouterStateTree {
  root: RouteNode<*, *>

  constructor(root: RouteNode<*, *>) {
    extendObservable(this, {
      root: root
    })
  }

  find(predicate: (x: RouteNode<*, *>) => boolean) {
    return findNode(predicate, this.root)
  }

  async pathFromRoot(url: string, onExhausted: OnExhaustedFn): Promise<MatchResult[]> {
    return await findPathFromRoot(this.root, url, onExhausted)
  }
}
