// @flow
import { when } from 'mobx'
import type { History } from 'history'
import RouterStore from './routing/RouterStore'
import type { Href, RouteNode } from './routing/types'
import Scheduler from './scheduling/Scheduler'

export type HistoryCreatorFn = (opts: any) => History

class Router {
  store: RouterStore
  scheduler: Scheduler
  history: History
  dispose: null | Function

  constructor(
    historyCreator: HistoryCreatorFn | [HistoryCreatorFn, Object],
    routes: RouteNode[]
  ) {
    this.dispose = null

    this.history = typeof historyCreator === 'function'
      ? historyCreator({
          getUserConfirmation: this.scheduleTransition
        })
      : historyCreator[0]({
          ...historyCreator[1],
          getUserConfirmation: this.scheduleTransition
        })

    // Block history on every transition, and we'll let the scheduler handle the lifecycle.
    this.history.block('') // This message is never actually used, just a placeholder.
    this.store = new RouterStore(this.history.location, routes)
    this.scheduler = new Scheduler(this.store)
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

  push(href: Href) {
    this.history.push(href)

    return new Promise(res => {
      when(() => this.scheduler.navigation === null, res)
    })
  }

  replace(href: Href) {
    this.history.replace(href)

    return new Promise(res => {
      when(() => this.scheduler.navigation === null, res)
    })
  }

  goBack() {
    this.history.goBack()

    return new Promise(res => {
      when(() => this.scheduler.navigation === null, res)
    })
  }

  // TODO: THis should push the callback into a queue somewhere so we can pick it up in scheduler.
  scheduleTransition = (__: string, callback: (continueTransition: boolean) => void) => {
    this.scheduler.scheduleTransition(callback)
  }
}

export default Router
