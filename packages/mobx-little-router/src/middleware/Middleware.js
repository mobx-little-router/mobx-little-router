// @flow
import { EventTypes } from '../events'
import type RouterStore from '../model/RouterStore'
export type Computation = (evt: *) => *

export type IMiddleware = {
  fold: (evt: *, store: ?RouterStore) => *,
  concat: (other: IMiddleware) => IMiddleware
}

export default function Middleware(f: Computation): IMiddleware {
  return {
    fold: (evt: *) => {
      try {
        return evt ? f(evt) : evt
      } catch (error) {
        return {  ...evt, type: EventTypes.NAVIGATION_ERROR, error }
      }
    },
    concat: other => Middleware(evt => {
      if (typeof other.fold === 'function') {
        return other.fold(f(evt))
      }
      return evt
    })
  }
}

Middleware.EMPTY = Middleware(x => x)
