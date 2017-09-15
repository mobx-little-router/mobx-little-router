// @flow
import { EventTypes } from '../events'
export type Computation = (evt: *) => *

export type IMiddleware = {
  fold: (evt: *) => *,
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
    concat: other => Middleware(evt => other.fold(f(evt)))
  }
}

Middleware.EMPTY = Middleware(x => x)
