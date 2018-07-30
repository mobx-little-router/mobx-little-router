// @flow
import type { InstallOptions } from 'mobx-little-router'
import { Router } from 'mobx-little-router'
import * as router from 'mobx-little-router'
import transformReactConfig from './middleware/transformReactConfig'

export default function install(opts: InstallOptions): Router {
  opts.middleware = (opts.middleware || router.Middleware.EMPTY).concat(transformReactConfig)
  return router.install(opts)
}
