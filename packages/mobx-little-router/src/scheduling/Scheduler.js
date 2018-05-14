// @flow
import type { Action } from 'history'
import { action, autorun, extendObservable, observable, reaction, runInAction, when } from 'mobx'
import type RouterStore from '../model/RouterStore'
import type { NavigationDescriptor } from '../model/Navigation'
import Navigation from '../model/Navigation'
import type { Event } from '../events'
import { EventTypes } from '../events'
import type { IMiddleware } from '../middleware/Middleware'
import processEvent from './processEvent'

export default class Scheduler {
  disposer: null | Function
  store: RouterStore
  middleware: IMiddleware
  currentNavigation: Navigation
  event: Event

  constructor(store: RouterStore, middleware: IMiddleware) {
    const initialNavigation = new Navigation({
      type: 'POP',
      sequence: -1, // this makes the first actual navigation sequence 0
      to: null
    })
    extendObservable(this, {
      currentNavigation: initialNavigation,
      event: { type: EventTypes.EMPTY, navigation: initialNavigation },
      disposer: null,
      store: store,
      middleware: middleware
    }, {
      disposer: observable.ref,
      store: observable.ref,
      middleware: observable.ref
    })
  }

  start() {
    // Watch for event changes, and dispatches the next event in the chain if it is not cancelled or ended.
    this.disposer = reaction(
      () => this.event,
      evt => {
        processEvent(evt, this.store)
          .then(next => {
            if (next !== null && next.type !== EventTypes.EMPTY) {
              this.dispatch(next)
            }
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
      evt = this.middleware.fold(evt, this.store)
      if (evt) {
        this.event = evt
      }
    }
  })

  schedule(next: NavigationDescriptor) {
    // If there is an existing navigation in transition, then cancel it.
    if (
      this.currentNavigation &&
      this.event.done !== true
    ) {
      this.dispatch({
        type: EventTypes.NAVIGATION_CANCELLED,
        navigation: this.currentNavigation,
        nextNavigation: null,
        done: true
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
