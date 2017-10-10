// @flow
import { autorun, computed, extendObservable, when } from 'mobx'
import QueryString from 'qs'
import delay from './util/delay'
import type { Action, History } from 'history'
import createRouteStateTreeNode from './model/createRouteStateTreeNode'
import RouterStore from './model/RouterStore'
import type { Config, Href } from './model/types'
import Scheduler from './scheduling/Scheduler'
import type { Event } from './events'
import { EventTypes } from './events'
import { NavigationTypes } from './model/Navigation'
import type { IMiddleware } from './middleware/Middleware'

class Router {
  store: RouterStore
  scheduler: Scheduler
  initialChildren: Config<*>[]
  history: History
  disposers: Function[]
  nextNavigation: * // This is computed from Scheduler event observable.

  constructor(
    history: History,
    config: Config<*>[],
    getContext: void | (() => any),
    middleware: IMiddleware
  ) {
    this.disposers = []

    this.history = history
    const root = createRouteStateTreeNode({ path: '', match: 'partial' }, getContext) // Initial root.
    this.initialChildren = config
    this.store = new RouterStore(root)
    this.scheduler = new Scheduler(this.store, middleware)

    extendObservable(this, {
      nextNavigation: computed(() => {
        const { event } = this.scheduler
        return event !== null
          ? event.nextNavigation !== null ? event.nextNavigation : null
          : null
      })
    })
  }

  // We may want the start to take in a callback with the router instance as the parameter.
  // This means we can do `.start(router => {/* do stuff with router */})`, as opposed
  // to `.start().then(() => {/* do stuff with router in original scope */})`
  async start(callback: ?Function) {
    let error: any = null
    try {
      this.scheduler.start()

      // Loads initial set of children (running through all middleware).
      this.scheduler.dispatch({
        type: EventTypes.CHILDREN_LOADING,
        leaf: { node: this.store.state.root },
        children: this.initialChildren
      })

      // Look for any next navigation from events and call corresponding method on history.
      this.disposers.push(autorun(this.handleNextNavigation))
      // Initial location.
      this.disposers.push(this.history.listen(this.handleLocationChange))

      await delay(0)

      // Schedule initial nextNavigation.
      await this.scheduler.schedule(asNavigation(this.history.location))

      // Wait until nextNavigation is processed.
      await this.navigated()

      if (this.scheduler.event.done === true) {
        if (this.scheduler.event.type === EventTypes.NAVIGATION_ERROR) {
          error = this.scheduler.event.error
        } else {
          callback && callback(this)
        }
      } else {
        // TODO: Provide better hint to fix detected errors.
        error = new Error('Router failed to start for unknown reasons')
      }
    } catch (err) {
      error = err
    }

    if (error) {
      this.stop()
      throw error
    }
  }

  stop() {
    this.scheduler.stop()
    this.disposers.forEach(f => f())
  }

  subscribeEvent(f: (x: Event) => void): () => void {
    return autorun(() => {
      const { event } = this.scheduler
      if (event !== null) {
        f(event)
      }
    })
  }

  push(href: Href) {
    this.history.push(withSearch(href))
    return this.navigated()
  }

  replace(href: Href) {
    this.history.replace(withSearch(href))
    return this.navigated()
  }

  goBack() {
    this.history.goBack()
    return this.navigated()
  }

  /* Private helpers */

  // Waits for next navigation event to be processed and resolves.
  navigated(): Promise<void> {
    return new Promise(res => {
      when(() => {
        const { event } = this.scheduler
        return event.done === true
      }, res)
    })
  }

  handleNextNavigation = () => {
    const { nextNavigation } = this

    if (!nextNavigation) {
      return
    }

    // Do this on next tick so we don't clobber current event.
    // TODO: Move this redirect logic to a middleware.
    setTimeout(() => {
      switch (nextNavigation.type) {
        case NavigationTypes.PUSH:
          return this.push(nextNavigation.to)
        case NavigationTypes.REPLACE:
          return this.replace(nextNavigation.to)
        case NavigationTypes.GO_BACK:
          return this.goBack()
        default:
          throw new TypeError(`Invalid navigation returned (${nextNavigation.type})`)
      }
    })
  }

  handleLocationChange = (location: Object, action: ?Action) => {
    this.scheduler.schedule(asNavigation(location, action))
  }
}

function asNavigation(location: Object, action: ?Action) {
  return {
    type: action || 'POP',
    to: {
      ...location,
      pathname: normalizePath(location.pathname)
    }
  }
}

function normalizePath(x: string) {
  return x.endsWith('/') ? x : `${x}/`
}

function withSearch(href: Href) {
  if (typeof href === 'string') {
    return href
  } else {
    const qs = href.query ? QueryString.stringify(href.query) : ''
    return {
      ...href,
      search: qs ? `?${qs}` : qs
    }
  }
}

export default Router
