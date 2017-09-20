// @flow
import type { Action } from 'history'
import { action, autorun, extendObservable, reaction, runInAction, when } from 'mobx'
import type RouterStore from '../model/RouterStore'
import type { Definition } from '../model/Navigation'
import Navigation from '../model/Navigation'
import type { Event } from '../events'
import { EventTypes } from '../events'
import type { IMiddleware } from '../middleware/Middleware'
import processEvent from './processEvent'
import withQueryMiddleware from './util/withQueryMiddleware'

export default class Scheduler {
  disposer: null | Function
  store: RouterStore
  middleware: IMiddleware
  currentNavigation: Navigation
  event: Event
  cancelled: Navigation

  isNavigating = false

  constructor(store: RouterStore, middleware: IMiddleware) {
    const initialNavigation = new Navigation({
      type: 'POP',
      sequence: -1,
      to: null,
      from: null
    })
    extendObservable(this, {
      cancelled: null,
      currentNavigation: initialNavigation,
      event: { type: EventTypes.EMPTY, navigation: initialNavigation }
    })
    this.disposer = null
    this.store = store
    this.middleware = withQueryMiddleware.concat(middleware)
  }

  start() {
    // Watch for event changes, and dispatches the next event in the chain if it is not cancelled or ended.
    this.disposer = reaction(
      () => this.cancelled || this.event,
      evt => {
        if (evt instanceof Navigation) {
          evt.cancel()
          
          this.dispatch({
            type: EventTypes.NAVIGATION_CANCELLED,
            navigation: evt,
            nextNavigation: null
          })
          this.cancelled = null
          return
        }

        if (
          evt.type === EventTypes.NAVIGATION_CANCELLED ||
          evt.type === EventTypes.NAVIGATION_END
        ) {
          runInAction(() => {
            this.store.clearPrevRoutes()
          })
          return
        }

        processEvent(evt, this.store).then(next => {
          // If there are no navigation to go to, ignore.
          if (!next || !(next.navigation instanceof Navigation)) return

          // Check that the sequence is same or incremented, otherwise it's a stale navigation and should be ignored.
          this.dispatch(next)
        })
      }
    )
  }

  stop() {
    this.disposer && this.disposer()
    this.disposer = null
  }

  dispatch = action((evt: null | Event) => {
    if (evt) {
      evt = this.middleware.fold(evt)
      if (evt) {
        this.event = evt
      }
    }
  })

  schedule(next: Definition) {
    if (!hasChanged(this.store.location, next.to)) return

    if (
      this.currentNavigation &&
      this.currentNavigation.shouldTransition &&
      this.event.type !== EventTypes.NAVIGATION_END
    ) {
      runInAction(() => {
        this.cancelled = this.currentNavigation
      })
    }

    runInAction(() => {
      this.currentNavigation = this.currentNavigation.next(next)
      this.dispatch({
        type: EventTypes.NAVIGATION_START,
        navigation: this.currentNavigation
      })
    })
  }
}

function hasChanged(curr, next) {
  // If location path and query has not changed, skip it.
  return !curr || curr.pathname !== next.pathname || curr.search !== next.search
}
