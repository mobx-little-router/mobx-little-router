// @flow

import Route from './routing/Route'
import type { HistoryCreatorFn } from './Router'
import Router from './Router'
import type { Config } from './routing/types'
import type { History } from 'history'

type Options = {
  createHistory: HistoryCreatorFn | [HistoryCreatorFn, Object],
  routes: Config[]
}

export default function install(opts: Options): Router {
  return new Router(opts.createHistory, opts.routes.map(Route))
}
