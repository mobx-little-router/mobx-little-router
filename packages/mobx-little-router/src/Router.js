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
import { TransitionFailure } from './errors'
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
    try {
      this.scheduler.start()

      if (process.env.NODE_ENV !== 'production') {
        this.disposers.push(this.subscribeEvent(this.logErrors))
      }

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

      callback && callback(this)
    } catch (err) {
      console.error(err)
      this.stop()
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
  navigated() {
    return new Promise(res => {
      when(() => {
        const { event } = this.scheduler
        const { location } = this.store
        return (
          event.done === true && typeof location.pathname === 'string'
        )
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

  logErrors = (evt: Event) => {
    if (evt.type === EventTypes.NAVIGATION_ERROR) {
      const { error } = evt
      if (error && !(error instanceof TransitionFailure)) {
        console.error('[router] Uncaught exception encountered during router event.', error)
      }
    }
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
    const qs = href.query ? QueryString.stringify(href.query)  : ''
    return {
      ...href,
      search: qs ? `?${qs}` : qs
    }
  }
}

export default Router
