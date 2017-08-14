// @flow

import RouterStore from './routing/RouterStore'
import HistoryManager from './history/HistoryManager'
import type { HistoryCreatorFn } from './history/types'
import type { History } from 'history'

type Module = {
  history: History,
  store: RouterStore,
  start: () => void,
  stop: () => void
}

export default function install(f: HistoryCreatorFn): Module {
  const store = new RouterStore()
  const manager = new HistoryManager(f, store)
  return {
    history: manager.history,
    store,
    start: () => manager.start(),
    stop: () => manager.stop()
  }
}
