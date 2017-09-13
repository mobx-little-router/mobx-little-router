// @flow
import Router from './Router'
import type { Config } from './model/types'
import type { Event } from './events'
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

export { EventTypes } from './events'
export type { Event } from './events'

export { TransitionTypes } from './transition/types'
export type { TransitionType, TransitionEvent, TransitionFn } from './transition/types'

export { default as Middleware } from './middleware/Middleware'
export { default as transformConfigLoad } from './middleware/transformConfigLoad'
export { default as transformConfig } from './middleware/transformConfig'
export { default as transformEventType } from './middleware/transformEventType'
export { default as transformNavigation } from './middleware/transformNavigation'

export { default as areRoutesEqual } from './model/util/areRoutesEqual'
