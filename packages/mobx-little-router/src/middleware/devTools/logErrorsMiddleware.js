// @flow
import Middleware from '../Middleware'
import { runInAction } from 'mobx'
import { EventTypes } from '../../events'
import type { Event } from '../../events'

const logErrorsMiddleware = process.env.NODE_ENV === 'development'
  ? Middleware((evt: Event): Event => {
      if (evt.type === EventTypes.NAVIGATION_ERROR) {
        console.error(`[router] Unhandled error caught in router`, evt.error)
      }
      return evt
    })
  : Middleware.EMPTY

export default logErrorsMiddleware
