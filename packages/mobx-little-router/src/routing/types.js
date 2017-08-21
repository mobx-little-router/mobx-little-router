// @flow
import { TreeNode } from '../util/tree'
import type { MatchFn } from './matchers'
import type { History, Location as HistoryLocation } from 'history'

export type Query = { [key: string]: string }
export type Params = { [key: string]: string }

export type Location = $Shape<
  HistoryLocation & {
    params: Params,
    query: Query
  }
>

export type Href = Location | string

export type Config = {
  path: string,
  data?: Object,
  [GuardType]: GuardFn[],
  children?: Config[],
  loadChildren?: LoadChildrenConfigFn,
  match?: 'full' | 'partial'
}

export type LoadChildrenConfigFn = () => Promise<Config[]>

export type GuardFn = (node: RouteNode, params: Params) => Promise<void>

export const GuardTypes = {
  canActivate: 'canActivate',
  onEnter: 'onEnter',
  onLeave: 'onLeave',
  canDeactivate: 'canDeactivate',
  onError: 'onError'
}

export type { MatchFn }

export type GuardType = $Keys<typeof GuardTypes>

export type Hooks = { [GuardType]: GuardFn[] }

export type LoadChildrenRouteNode = () => Promise<RouteNode[]>

export type RouteValue = {
  key: string,
  // Original path provided to this route node.
  path: string,
  // Matched path parameters.
  params: null | Params,
  // Extra data that can be used to provide view specific functionality.
  // e.g. Route component, loading component, etc.
  data: Object,
  matcher: MatchFn,
  loadChildren?: null | LoadChildrenRouteNode,
  hooks: Hooks
}

export type RouteNode = TreeNode<RouteValue>

export type MatchResult = {
  node: RouteNode,
  remaining: string,
  params: Params
}
