// @flow
import { observable } from 'mobx'
import UrlPattern from 'url-pattern'
import { TreeNode, findNode, findPath } from '../util/tree'
import type { LifecycleFn, Params } from './types'

export const HookTypes = {
  canActivate: 'canActivate',
  onEnter: 'onEnter',
  onLeave: 'onLeave',
  canDeactivate: 'canDeactivate',
  onError: 'onError'
}

export type HookType = $Keys<typeof HookTypes>

export type Hooks = { [HookType]: LifecycleFn[] }

export type RouteValue = {
  key: string,
  // Original path provided to this route node.
  path: string,
  // Pattern to match segments with.
  pattern: null | UrlPattern,
  // Matched path parameters.
  params: null | Params,
  // Extra data that can be used to provide view specific functionality.
  // e.g. Route component, loading component, etc.
  data: Object,
  // Allows us to keep track of activated and deactivated states.
  isActive: boolean,

  // Lifecycle utilities
  hooks: Hooks
}

export type RouteNode = TreeNode<RouteValue>

export type MatchResult = {
  node: RouteNode,
  segment: string,
  params: Params
}

export default class RouterStateTree {
  @observable root: RouteNode

  constructor(root: RouteNode) {
    this.root = root
  }

  find(predicate: (x: RouteNode) => boolean) {
    return findNode(predicate, this.root)
  }

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
