// @flow
import type { History } from 'history'
import { runInAction } from 'mobx'
import RouterStore from './RouterStore'
import type { HistoryCreatorFn, GuardFn, GuardType } from '../types'
import Scheduler from './Scheduler'

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
      this.scheduler.scheduleNavigation(location, action).catch(err => {
        runInAction(() => {
          this.store.error = err
        })
      })
    })
  }

  stop() {
    this.scheduler.stop()
    this.dispose && this.dispose()
  }

  scheduleTransition = (__: string, callback: (continueTransition: boolean) => void) => {
    this.scheduler.scheduleTransition(callback)
  }

  addGuard = (type: GuardType, f: GuardFn) => {
    this.store.addGuard(type, f)
  }
}

export default HistoryManager
