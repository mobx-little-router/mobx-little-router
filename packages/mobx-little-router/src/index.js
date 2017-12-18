// @flow
import Router from './Router'
import type { Config } from './model/types'
import type { Event } from './events'
import type { History } from 'history'
import Middleware from './middleware/Middleware'
import type { IMiddleware } from './middleware/Middleware'
import withQueryMiddleware from './middleware/withQueryMiddleware'
import withRelativePath from './middleware/withRelativePath'
import withRedirect from './middleware/withRedirect'
import devTools from './middleware/devTools'

export type InstallOptions = {
  history: History,
  routes: Config<*>[],
  getContext?: () => any,
  middleware?: IMiddleware
}

export function install(opts: InstallOptions): Router {
  return new Router(
    opts.history,
    opts.routes,
    opts.getContext,
    withQueryMiddleware
      .concat(opts.middleware || Middleware.EMPTY)
      .concat(withRedirect)
      .concat(withRelativePath)
      .concat(devTools) // devTools always has to be the last in case there are any config/node transforms
  )
}

export { default as RouterStore } from './model/RouterStore'

export { default as Router } from './Router'

export type {
  Config,
  Route,
  Href,
  Location,
  LocationShape,
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
export { default as devTools } from './middleware/devTools'

export { default as areRoutesEqual } from './model/util/areRoutesEqual'

export type { IMiddleware } from './middleware/Middleware'

export {
  RouteError,
  NoMatch,
  NotFound,
  Unauthorized,
  BadRequest
} from './errors'
