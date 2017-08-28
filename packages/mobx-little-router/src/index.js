// @flow
import Route from './model/Route'
import type { HistoryCreatorFn } from './Router'
import Router from './Router'
import type { Config } from './model/types'
import type { History } from 'history'

type Options = {
  createHistory: HistoryCreatorFn | [HistoryCreatorFn, Object],
  routes: Config[]
}

export function install(opts: Options): Router {
  return new Router(opts.createHistory, opts.routes.map(Route))
}

export { default as RouterStore } from './model/RouterStore'

export { default as Router } from './Router'

export type { Href, Location, Query, Params, RouteNode, RouteValue } from './model/types'

export { EventTypes } from './scheduling/events'
export type { Event } from './scheduling/events'

export { TransitionTypes } from './transition/types'
export type { TransitionType, TransitionEvent, TransitionFn } from './transition/types'
