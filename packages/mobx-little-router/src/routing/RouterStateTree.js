// @flow
import { observable } from 'mobx'
import { findNode } from '../util/tree'
import type { RouteNode } from './types'
import pathFromRoot from '../matching/pathFromRoot'
import type { MatchResult } from '../matching/types'

export default class RouterStateTree {
  @observable root: RouteNode

  constructor(root: RouteNode) {
    this.root = root
  }

  find(predicate: (x: RouteNode) => boolean) {
    return findNode(predicate, this.root)
  }

  // TODO: We should handle `loadChildren` to resolve dynamically. See: #2
  async pathFromRoot(path: string[]): Promise<MatchResult[]> {
    return pathFromRoot(this.root, path)
  }
}
