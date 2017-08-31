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

export type BasicConfig<D> = {
  path: string,
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

export type RedirectConfig<D> = {
  path: string,
  redirectTo: Href,
  getData?: () => D,
  key?: string,
  match?: 'full' | 'partial',
  children?: empty
}

export type LoadChildrenConfigFn<D> = () => Promise<Config<D>[]>

export type GuardFn = (
  node: ActivatedRoute<*, *>,
  nav: Navigation
) => boolean | Promise<void>

export type LifecycleFn = (
  node: ActivatedRoute<*, *>,
  nav: Navigation
) => Promise<void>

export type ErrorHandler = (node: RouteNode<*, *>, context: Object) => Promise<void>

export type LoadChildrenRouteNode = () => Promise<RouteNode<*, *>[]>

export type RouteValue<C, D> = {
  key: string,
  // Original path provided to this route node.
  path: string,
  matcher: MatchFn,
  loadChildren?: null | LoadChildrenRouteNode,
  canActivate: GuardFn,
  canDeactivate: GuardFn,
  willActivate: LifecycleFn,
  willDeactivate: LifecycleFn,
  onError: null | ErrorHandler,
  onTransition: null | TransitionFn,
  getContext: () => C,
  getData: () => D
}

export type RouteNode<C, D> = ITreeNode<RouteValue<C, D>>

export type MatchResult<C, D> = {
  node: RouteNode<C, D>,
  remaining: string,
  params: Params
}

export type ActivatedRoute<C,D> = {
  key: string,
  node: RouteNode<C, D>,
  data: D,
  context: C,
  params: Params,
  onTransition: null | TransitionFn
}
