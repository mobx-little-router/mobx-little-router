// @flow
import { autorun, when } from 'mobx'
import type { History } from 'history'
import RouterStore from './routing/RouterStore'
import type { Href, RouteNode } from './routing/types'
import Scheduler from './scheduling/Scheduler'
import type { Event } from './scheduling/events'
import { EventTypes } from './scheduling/events'
import { GuardFailure } from './errors'

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

    // TODO: We should just be passing in the History object instead of the creator.
    this.history = typeof historyCreator === 'function'
      ? historyCreator()
      : historyCreator[0](historyCreator[1])
    this.store = new RouterStore(routes)
    this.scheduler = new Scheduler(this.store)
  }

  // We may want the start to take in a callback with the router instance as the parameter.
  // This means we can do `.start(router => {/* do stuff with router */})`, as opposed
  // to `.start().then(() => {/* do stuff with router in original scope */})`
  async start(callback: ?Function) {
    this.scheduler.start()

    // Schedule initial navigation.
    await this.scheduler.scheduleNavigation(this.history.location)

    // Wait until navigation is processed.
    await this.navigated()

    const f = this.history.listen((location) =>
      this.scheduler.scheduleNavigation(location)
    )

    const g = this.subscribeEvent(this.handleNavigationEvents)

    this.dispose = () => {
      f()
      g()
    }

    callback && callback(this)
  }

  stop() {
    this.scheduler.stop()
    this.dispose && this.dispose()
  }

  subscribeEvent(f: (x: Event) => void): () => void {
    return autorun(() => {
      const { event } = this.scheduler
      if (event !== null) {
        f(event)
      }
    })
  }

  handleNavigationEvents = (evt: Event) => {
    if (evt.type === EventTypes.NAVIGATION_ABORTED) {
      const { transition } = evt
      if (transition.type === 'GO_BACK') {
        this.goBack()
      } else if (transition.type === 'PUSH') {
        this.push(transition.to)
      } else if (transition.type === 'REPLACE') {
        this.replace(transition.to)
      }
    }
  }

  // Waits for next navigation event to be processed and resolves.
  navigated() {
    return new Promise(res => {
      when(() => this.scheduler.navigation === null, res)
    })
  }

  push(href: Href) {
    this.history.push(href)
    return this.navigated()
  }

  replace(href: Href) {
    this.history.replace(href)
    return this.navigated()
  }

  goBack() {
    this.history.goBack()
    return this.navigated()
  }
}

export default Router
