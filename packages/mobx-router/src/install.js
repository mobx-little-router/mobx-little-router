// @flow

import RouterStore from './routing/RouterStore'
import createRouteNode from './routing/createRouteNode'
import HistoryManager from './history/HistoryManager'
import type { HistoryCreatorFn } from './history/types'
import type { Config } from './routing/types'
import type { History } from 'history'

type Module = {
  history: History,
  store: RouterStore,
  start: () => void,
  stop: () => void
}

type Options = {
  createHistory: HistoryCreatorFn,
  routes: Config[]
}

export default function install(opts: Options): Module {
  const store = new RouterStore(opts.routes.map(createRouteNode))
  const manager = new HistoryManager(opts.createHistory, store)
  return {
    history: manager.history,
    store,
    start: () => manager.start(),
    stop: () => manager.stop()
  }
}
