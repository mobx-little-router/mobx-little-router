// @flow
import { autorun, computed, extendObservable, when } from 'mobx'
import type { History } from 'history'
import RouterStore from './model/RouterStore'
import type { Href, RouteNode } from './model/types'
import Scheduler from './scheduling/Scheduler'
import type { Event } from './scheduling/events'
import Navigation, { NavigationTypes } from './model/Navigation'
import { InvalidTransition} from './errors'

export type HistoryCreatorFn = (opts: any) => History

class Router {
  store: RouterStore
  scheduler: Scheduler
  history: History
  dispose: null | Function
  currentNavigation: *

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

    extendObservable(this, {
      currentNavigation: computed(this.getNextNavigation)
    })
  }

  // We may want the start to take in a callback with the router instance as the parameter.
  // This means we can do `.start(router => {/* do stuff with router */})`, as opposed
  // to `.start().then(() => {/* do stuff with router in original scope */})`
  async start(callback: ?Function) {
    this.scheduler.start()

    const f = autorun(this.handleNextTransition)

    // Schedule initial navigation.
    await this.scheduler.scheduleNavigation(asNavigation(this.history.location))

    // Wait until navigation is processed.
    await this.navigated()

    const g = this.history.listen(location => this.scheduler.scheduleNavigation(asNavigation(location)))

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

  subscribeEvent(f: (x: Event) => void): () => void {
    return autorun(() => {
      const { event } = this.scheduler
      if (event !== null) {
        f(event)
      }
    })
  }

  /* Private helpers */

  // Waits for next navigation event to be processed and resolves.
  navigated() {
    return new Promise(res => {
      when(() => this.scheduler.nextNavigation === null, res)
    })
  }

  getNextNavigation = () => {
    const { event } = this.scheduler

    if (event !== null) {
      return event.nextNavigation || null
    }

    return null
  }

  handleNextTransition = () => {
    const { currentNavigation } = this

    if (!currentNavigation) {
      return
    }

    switch(currentNavigation.type) {
      case NavigationTypes.PUSH:
        return this.push(currentNavigation.to)
      case NavigationTypes.REPLACE:
        return this.replace(currentNavigation.to)
      case NavigationTypes.GO_BACK:
        return this.goBack()
      default:
        throw new InvalidTransition(currentNavigation)
    }
  }
}

export default Router

function asNavigation(location: Object) {
  return {
    type: 'PUSH',
    to: {
      ...location,
      pathname: normalizePath(location.pathname)
    }
  }
}

function normalizePath(x: string) {
  if (x.endsWith('/')) {
    return x
  } else {
    return `${x}/`
  }
}
