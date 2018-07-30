// @flow
import type { InstallOptions } from '../../mobx-little-router/es'
import { Router } from '../../mobx-little-router/es'
import * as router from '../../mobx-little-router/es'
import transformReactConfig from './middleware/transformReactConfig'

export default function install(opts: InstallOptions): Router {
  opts.middleware = (opts.middleware || router.Middleware.EMPTY).concat(transformReactConfig)
  return router.install(opts)
}
