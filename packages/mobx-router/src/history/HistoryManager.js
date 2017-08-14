// @flow
import type { History } from 'history'
import RouterStore from '../routing/RouterStore'
import type { HistoryCreatorFn } from './types'
import Scheduler from '../scheduling/Scheduler'

class HistoryManager {
  store: RouterStore
  scheduler: Scheduler
  history: History
  dispose: null | Function

  constructor(historyCreator: HistoryCreatorFn, store: RouterStore) {
    this.dispose = null

    this.history = historyCreator({
      getUserConfirmation: this.scheduleTransition
    })

    // Block history on every transition, and we'll let the scheduler handle the lifecycle.
    this.history.block('') // This message is never actually used, just a placeholder.

    this.scheduler = new Scheduler(store)
    this.store = store
  }

  start() {
    this.scheduler.start()
    this.dispose = this.history.listen((location, action) => {
      this.scheduler.scheduleNavigation(location, action)
    })
  }

  stop() {
    this.scheduler.stop()
    this.dispose && this.dispose()
  }

  // TODO: THis should push the callback into a queue somewhere so we can pick it up in scheduler.
  scheduleTransition = (__: string, callback: (continueTransition: boolean) => void) => {
    this.scheduler.scheduleTransition(callback)
  }
}

export default HistoryManager
