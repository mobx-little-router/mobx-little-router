// @flow
import Router from './Router'
import type { Config } from './model/types'
import type { Event } from './scheduling/events'
import type { History } from 'history'

type Options = {
  history: History,
  routes: Config<*>[],
  getContext: () => any,
  middleware?: (evt: Event) => null | Event
}

export function install(opts: Options): Router {
  return new Router(
    opts.history,
    opts.routes,
    opts.getContext || (() => ({})),
    opts.middleware
  )
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
