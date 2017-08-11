// @flow
import type { History, Location as HistoryLocation } from 'history'
import type { RouteNode } from './RouterStateTree'

export type Query = { [key: string]: string }
export type Params = { [key: string]: string }

export type HistoryCreatorFn = (opts: any) => History

export type Location = $Shape<
  HistoryLocation & {
    params: Params,
    query: Query
  }
>

export type LifecycleFn = (node: RouteNode, params: Params) => Promise<void>
