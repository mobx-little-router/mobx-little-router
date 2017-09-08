// @flow
import type { History, Location as HistoryLocation } from 'history'
import type { ITreeNode } from '../util/tree'
import type { TransitionFn } from '../transition/types'
import type { MatchFn } from './matchers'
import Navigation from './Navigation'

export type { MatchFn }

export type Query = { [key: string]: string }
export type Params = { [key: string]: string }

export type Location = $Shape<
  HistoryLocation & {
    params: Params,
    query: Query
  }
>

export type Href = Location | string

export type Config<D> = BasicConfig<D> | RedirectConfig<D>

export type BasicConfig<D: Object> = {
  path: string,
  query?: Array<string>,
  getData?: () => D,
  key?: string,
  children?: Config<D>[],
  loadChildren?: LoadChildrenConfigFn<D>,
  match?: 'full' | 'partial',
  canActivate?: GuardFn,
  canDeactivate?: GuardFn,
  willActivate?: LifecycleFn,
  willDeactivate?: LifecycleFn,
  onError?: ErrorHandler,
  onTransition?: TransitionFn
}

export type RedirectConfig<D: Object> = {
  path: string,
  redirectTo: Href,
  getData?: () => D,
  key?: string,
  match?: 'full' | 'partial',
  children?: empty
}

export type LoadChildrenConfigFn<D> = () => Promise<Config<D>[]>

export type GuardFn = (
  node: Route<*, *>,
  nav: Navigation
) => boolean | Promise<void>

export type LifecycleFn = (
  node: Route<*, *>,
  nav: Navigation
) => Promise<void>

export type ErrorHandler = (node: RouteStateTreeNode<*, *>, context: Object) => Promise<void>

export type LoadChildrenRouteStateTreeNode = () => Promise<RouteStateTreeNode<*, *>[]>

export type RouteValue<C: Object, D: Object> = {
  key: string,
  // Original path provided to this route node.
  path: string,
  query: Array<string>,
  matcher: MatchFn,
  loadChildren?: null | LoadChildrenRouteStateTreeNode,
  canActivate: GuardFn,
  canDeactivate: GuardFn,
  willActivate: LifecycleFn,
  willDeactivate: LifecycleFn,
  onError: null | ErrorHandler,
  onTransition: null | TransitionFn,
  getContext: () => C,
  getData: () => D
}

export type RouteStateTreeNode<C, D> = ITreeNode<RouteValue<C, D>>

export type PathElement<C, D> = {
  node: RouteStateTreeNode<C, D>,
  remaining: string,
  segment: string,
  params: Params
}

export type Route<C,D> = {
  key: string,
  node: RouteStateTreeNode<C, D>,
  data: D,
  context: C,
  params: Params,
  query: Query,
  segment: string, // This is the matched segment from URL. e.g. "/123" for ":id"
  onTransition: null | TransitionFn
}
