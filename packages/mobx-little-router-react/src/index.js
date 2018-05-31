// @flow

export { default as RouterContext } from './contexts/RouterContext'
export { default as OutletContext } from './contexts/OutletContext'
export { default as Link } from './components/Link'
export { default as Outlet } from './components/Outlet'
export { default as withRouter } from './hoc/withRouter'
export { default as withOutlet } from './hoc/withOutlet'
export { default as transformReactConfig } from './middleware/transformReactConfig'

import * as router from 'mobx-little-router'
import transformReactConfig from './middleware/transformReactConfig'
import { Router } from 'mobx-little-router'
import type { InstallOptions } from 'mobx-little-router'

export function install(opts: InstallOptions): Router {
  opts.middleware = (opts.middleware || router.Middleware.EMPTY).concat(transformReactConfig)
  return router.install(opts)
}
