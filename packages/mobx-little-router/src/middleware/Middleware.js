// @flow
import { EventTypes } from '../events'
import type RouterStore from '../model/RouterStore'
export type Computation = (evt: *, store: ?RouterStore) => *

export type IMiddleware = {
  fold: (evt: *, store: ?RouterStore) => *,
  concat: (other: IMiddleware) => IMiddleware
}

export default function Middleware(f: Computation): IMiddleware {
  return {
    fold: (evt: *, store: ?RouterStore) => {
      try {
        return evt ? f(evt, store) : evt
      } catch (error) {
        return {  ...evt, type: EventTypes.NAVIGATION_ERROR, error }
      }
    },
    concat: other => Middleware((evt, store) => {
      if (typeof other.fold === 'function') {
        return other.fold(f(evt, store), store)
      }
      return evt
    })
  }
}

Middleware.EMPTY = Middleware(x => x)
