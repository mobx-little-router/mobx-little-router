// @flow
import Middleware from './Middleware'
import type { IMiddleware } from './Middleware'

export default function(...xs: IMiddleware[]) {
  return xs.reduce((acc, x) => x.concat(acc), Middleware.EMPTY)
}
