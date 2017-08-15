// @flow

import RouterStore from './routing/RouterStore'
import createRouteNode from './routing/createRouteNode'
import Router from './Router'
import type { HistoryCreatorFn } from './Router'
import type { Config } from './routing/types'
import type { History } from 'history'

type Options = {
  createHistory: HistoryCreatorFn | [HistoryCreatorFn, Object],
  routes: Config[]
}

export default function install(opts: Options): Router {
  return new Router(opts.createHistory, opts.routes.map(createRouteNode))
}
