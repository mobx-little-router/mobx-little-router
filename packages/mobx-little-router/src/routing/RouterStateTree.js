// @flow
import { extendObservable } from 'mobx'
import { findNode } from '../util/tree'
import type { MatchResult, RouteNode } from './types'
import shallowClone from '../routing/shallowClone'
import findPathFromRoot from './findPathFromRoot'
import type { OnExhaustedFn } from './findPathFromRoot'

export default class RouterStateTree {
  root: RouteNode

  constructor(root: RouteNode) {
    extendObservable(this, {
      root: root
    })
  }

  find(predicate: (x: RouteNode) => boolean) {
    return findNode(predicate, this.root)
  }

  async pathFromRoot(url: string, onExhausted: OnExhaustedFn): Promise<MatchResult[]> {
    const path = await findPathFromRoot(this.root, url, onExhausted)
    return path.map(({ node, params, remaining }) => {
      const x = shallowClone(node)
      x.value.params = params
      return {
        node: x,
        remaining: remaining,
        params
      }
    })
  }
}
