// @flow
import UrlPattern from 'url-pattern'
import type { Params } from '../history/types'
import { TreeNode } from '../util/tree'

export type LifecycleFn = (node: RouteNode, params: Params) => Promise<void>

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
