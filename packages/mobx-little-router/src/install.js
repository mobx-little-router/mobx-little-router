// @flow
import { History } from 'history'
import type { Config } from './model/types'
import type { IMiddleware } from './middleware/Middleware'
import Middleware from './middleware/Middleware'
import Router from './Router'
import withQueryMiddleware from './middleware/withQueryMiddleware'
import withRedirect from './middleware/withRedirect'
import withRelativePath from './middleware/withRelativePath'
import devTools from './middleware/devTools'

export type SsrOptions = {
  state: Object
}

export type InstallOptions = {
  history: History,
  routes: Config<*>[],
  getContext?: () => any,
  middleware?: IMiddleware,
  ssr?: SsrOptions
}

export default function install(opts: InstallOptions): Router {
  return new Router(
    opts.history,
    opts.routes, {
      ssr: opts.ssr,
      getContext: opts.getContext,
      middleware: withQueryMiddleware
        .concat(opts.middleware || Middleware.EMPTY)
        .concat(withRedirect)
        .concat(withRelativePath)
        .concat(devTools) // devTools always has to be the last in case there are any config/node transforms
    }
  )
}
