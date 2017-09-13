// @flow
export type Computation = (evt: *) => *

export type IMiddleware = {
  fold: (evt: *) => *,
  concat: (other: IMiddleware) => IMiddleware
}

export default function Middleware(f: Computation): IMiddleware {
  return {
    fold: (evt: *) => (evt ? f(evt) : evt),
    concat: other => Middleware(evt => other.fold(f(evt)))
  }
}

Middleware.EMPTY = Middleware(x => x)
