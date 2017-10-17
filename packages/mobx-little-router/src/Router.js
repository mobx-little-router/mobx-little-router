/* @flow
 * This is the public facade over all of the routing interface.
 * The `Router` is a coordinator of other objects in the system.
 */
import { autorun, computed, extendObservable, when } from 'mobx'
import type { IObservableArray } from 'mobx'
import QueryString from 'qs'
import delay from './util/delay'
import type { Action, History } from 'history'
import createRouteStateTreeNode from './model/createRouteStateTreeNode'
import RouterStore from './model/RouterStore'
import type { Config, Href, Location, Route, Query } from './model/types'
import Scheduler from './scheduling/Scheduler'
import type { Event } from './events'
import { EventTypes } from './events'
import { NavigationTypes } from './model/Navigation'
import type { IMiddleware } from './middleware/Middleware'

class Router {
  // Public members
  store: RouterStore
  location: Location
  activeRoutes: IObservableArray<Route<*, *>>
  activeRouteKeys: string[]

  // Private members
  _scheduler: Scheduler
  _initialChildren: Config<*>[]
  _history: History
  _disposers: Function[]
  _nextNavigation: * // This is computed from Scheduler event observable.

  constructor(
    history: History,
    config: Config<*>[],
    getContext?: void | (() => any),
    middleware: IMiddleware
  ) {
    this._disposers = []

    this._history = history
    const root = createRouteStateTreeNode({ path: '', match: 'partial' }, getContext) // Initial root.
    this._initialChildren = config
    this.store = new RouterStore(root)
    this._scheduler = new Scheduler(this.store, middleware)

    extendObservable(this, {
      location: computed(() => this.store.location),
      activeRoutes: computed((): IObservableArray<Route<*, *>> => this.store.routes),
      activeRouteKeys: computed((): string[] => this.activeRoutes.map(r => r.node.value.key)),

      // Private usage to figure out if an event has a next navigation object.
      _nextNavigation: computed(() => {
        const { event } = this._scheduler
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
      this._scheduler.start()

      // Loads initial set of children (running through all middleware).
      this._scheduler.dispatch({
        type: EventTypes.CHILDREN_LOADING,
        leaf: { node: this.store.state.root },
        children: this._initialChildren
      })

      // Look for any next navigation from events and call corresponding method on history.
      this._disposers.push(autorun(this.handleNextNavigation))
      // Initial location.
      this._disposers.push(this._history.listen(this.handleLocationChange))

      await delay(0)

      // Schedule initial nextNavigation.
      await this._scheduler.schedule(asNavigation(this._history.location))

      // Wait until nextNavigation is processed.
      await this.navigated()

      if (this._scheduler.event.done === true) {
        if (this._scheduler.event.type === EventTypes.NAVIGATION_ERROR) {
          error = this._scheduler.event.error
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
    this._scheduler.stop()
    this._disposers.forEach(f => f())
  }

  subscribeEvent(f: (x: Event) => void): () => void {
    return autorun(() => {
      const { event } = this._scheduler
      if (event !== null) {
        f(event)
      }
    })
  }

  push(href: Href) {
    this._history.push(withSearch(href))
    return this.navigated()
  }

  replace(href: Href) {
    this._history.replace(withSearch(href))
    return this.navigated()
  }

  pushQuery(query: Query) {
    return this.push(`${this.location.pathname}?${QueryString.stringify(query)}`)
  }

  replaceQuery(query: Query) {
    return this.replace(`${this.location.pathname}?${QueryString.stringify(query)}`)
  }

  goBack() {
    this._history.goBack()
    return this.navigated()
  }

  /* Private helpers */

  // Waits for next navigation event to be processed and resolves.
  navigated(): Promise<void> {
    return new Promise(res => {
      when(() => {
        const { event } = this._scheduler
        return event.done === true
      }, res)
    })
  }

  handleNextNavigation = () => {
    const { _nextNavigation } = this

    if (!_nextNavigation) {
      return
    }

    // Do this on next tick so we don't clobber current event.
    // TODO: Move this redirect logic to a middleware.
    setTimeout(() => {
      switch (_nextNavigation.type) {
        case NavigationTypes.PUSH:
          return this.push(_nextNavigation.to)
        case NavigationTypes.REPLACE:
          return this.replace(_nextNavigation.to)
        case NavigationTypes.GO_BACK:
          return this.goBack()
        default:
          throw new TypeError(`Invalid navigation returned (${_nextNavigation.type})`)
      }
    })
  }

  handleLocationChange = (location: Object, action: ?Action) => {
    this._scheduler.schedule(asNavigation(location, action))
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
