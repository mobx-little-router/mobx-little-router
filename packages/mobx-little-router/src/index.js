// @flow
import type { HistoryCreatorFn } from './Router'
import Router from './Router'
import type { Config } from './model/types'
import type { History } from 'history'

type Options = {
  createHistory: HistoryCreatorFn | [HistoryCreatorFn, Object],
  routes: Config<*>[],
  getContext: () => any
}

export function install(opts: Options): Router {
  return new Router(opts.createHistory, opts.routes, opts.getContext || (() => ({})))
}

export { default as RouterStore } from './model/RouterStore'

export { default as Router } from './Router'

export type {
  Route,
  Href,
  Location,
  Query,
  Params,
  RouteStateTreeNode,
  RouteValue
} from './model/types'

export { EventTypes } from './scheduling/events'
export type { Event } from './scheduling/events'

export { TransitionTypes } from './transition/types'
export type { TransitionType, TransitionEvent, TransitionFn } from './transition/types'

export { default as areRoutesEqual } from './model/util/areRoutesEqual'
