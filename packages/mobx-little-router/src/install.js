// @flow

import RouterStore from './routing/RouterStore'
import createRouteNode from './routing/createRouteNode'
import Router from './Router'
import type { HistoryCreatorFn } from './Router'
import type { Config } from './routing/types'
import type { History } from 'history'

type Module = {
  history: History,
  store: RouterStore,
  start: () => void,
  stop: () => void
}

type Options = {
  createHistory: HistoryCreatorFn | [HistoryCreatorFn, Object],
  routes: Config[]
}

export default function install(opts: Options): Module {
  const manager = new Router(opts.createHistory, opts.routes.map(createRouteNode))
  return {
    history: manager.history,
    store: manager.store,
    start: () => manager.start(),
    stop: () => manager.stop()
  }
}
