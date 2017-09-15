// @flow
import compose from './compose'
import type { IMiddleware } from './Middleware'

export default function(...xs: IMiddleware[]) {
  return compose(...xs.reverse())
}
