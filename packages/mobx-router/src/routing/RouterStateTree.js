// @flow
import { observable } from 'mobx'
import UrlPattern from 'url-pattern'
import { TreeNode, findNode, findPath } from '../util/tree'
import type { RouteNode, MatchResult } from '../routing/types'

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
    const matched: MatchResult[] = []
    await findPath(
      (node: RouteNode, segment) => {
        const { value: { pattern, path } } = node

        // Try to match pattern if it exists.
        if (pattern !== null) {
          const params = pattern.match(segment)
          if (params !== null) {
            matched.push({ node, segment, params })
            return Promise.resolve(true)
          }
          // If pattern does not existing, we need to match on empty string (index route).
        } else if (path === segment) {
          matched.push({ node, segment, params: {} })
          return Promise.resolve(true)
        }

        // No match.
        return Promise.resolve(false)
      },
      this.root,
      path
    )

    return matched
  }
}
