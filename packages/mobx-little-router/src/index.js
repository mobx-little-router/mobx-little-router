// @flow
import type { Config } from './model/types'
import type { Event } from './events'
import type { History } from 'history'
import type { IMiddleware } from './middleware/Middleware'

export { default as install } from './install'
export type { InstallOptions } from './install'

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

export { serialize } from './serialization'

export { default as Middleware } from './middleware/Middleware'
export { default as transformConfigLoad } from './middleware/transformConfigLoad'
export { default as transformConfig } from './middleware/transformConfig'
export { default as transformEventType } from './middleware/transformEventType'
export { default as transformNavigation } from './middleware/transformNavigation'
export { default as devTools } from './middleware/devTools'

export { default as areRoutesEqual } from './model/util/areRoutesEqual'

export type { IMiddleware } from './middleware/Middleware'

export { RouteError, NotFound, Unauthorized, AuthenticationTimeout, BadRequest } from './errors'
