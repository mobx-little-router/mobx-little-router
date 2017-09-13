// @flow
import type { Action } from 'history'
import { TransitionFailure } from '../errors'
import { action, autorun, extendObservable, reaction, runInAction, when } from 'mobx'
import type RouterStore from '../model/RouterStore'
import type { Definition } from '../model/Navigation'
import Navigation from '../model/Navigation'
import TransitionManager from '../transition/TransitionManager'
import type { Event } from '../events'
import { EventTypes } from '../events'
import type { IMiddleware } from '../middleware/Middleware'
import Middleware from '../middleware/Middleware'
import nextEvent from './nextEvent'

export default class Scheduler {
  store: RouterStore
  disposers: Function[]
  currentNavigation: Navigation
  event: Event
  middleware: IMiddleware

  constructor(store: RouterStore, mComputation: ?(evt: Event) => null | Event) {
    this.store = store
    this.middleware = Middleware(mComputation || (x => x))
    this.disposers = []
    extendObservable(this, {
      currentNavigation: new Navigation({
        type: 'POP',
        sequence: -1,
        to: null,
        from: null
      }),
      event: { type: EventTypes.INITIAL }
    })
  }

  start() {
    // TODO: These should be in built-in middleware.
    // Also, CHILDREN_LOAD should always trigger NAVIGATION_RETRY, and should be in nextEvent.
    this.disposers.push(
      reaction(
        () => this.event,
        evt => {
          if (evt.type === EventTypes.CHILDREN_LOAD) {
            const { navigation, pathElements, leaf, children } = evt
            runInAction(() => {
              leaf.node.children.replace(children.slice())
            })
            this.dispatch({
              type: EventTypes.NAVIGATION_RETRY,
              navigation,
              pathElements,
              continueFrom: leaf
            })
          }
        }
      )
    )

    this.disposers.push(
      reaction(
        () => this.event,
        evt => {
          const { store } = this
          if (evt.type === EventTypes.NAVIGATION_AFTER_ACTIVATE) {
            const { navigation, routes, exiting, entering } = evt
            store.updateRoutes(routes)
            store.updateLocation(navigation.to)
            if (navigation.shouldTransition) {
              // Run and wait on transition of exiting and newly entering nodes.
              Promise.all([
                TransitionManager.run('exiting', exiting),
                TransitionManager.run('entering', entering)
              ]).then(() => {
                store.clearPrevRoutes()
              })
            }
          }
        }
      )
    )

    this.disposers.push(
      reaction(
        () => this.event,
        evt => {
          const { store } = this
          if (evt.type === EventTypes.NAVIGATION_ERROR) {
            const { error } = evt
            if (error instanceof TransitionFailure) {
              // Navigation error may be thrown by a guard or lifecycle hook.
              this.dispatch({
                type: EventTypes.NAVIGATION_CANCELLED,
                nextNavigation: error.navigation
              })
            } else {
              // Error instances should be set on the store and an error event is emitted.
              store.setError(error)
            }
          }
        }
      )
    )

    this.disposers.push(
      reaction(
        () => this.event,
        evt => {
          nextEvent(evt, this.store).then(next => {
            if (next) {
              this.dispatch(next)
            }
          })
        }
      )
    )
  }

  stop() {
    this.disposers.forEach(f => f())
    this.disposers = []
  }

  // Emit navigation events.
  dispatch = (evt: null | Event) => {
    runInAction(() => {
      if (evt) {
        evt = this.middleware.fold(evt)
        if (evt) {
          this.event = evt
        }
      }
    })
  }

  schedule = async (next: Definition) => {
    if (!hasChanged(this.store.location, next.to)) return
    this.dispatch({
      type: EventTypes.NAVIGATION_START,
      navigation: this.currentNavigation.next(next)
    })
  }
}

function hasChanged(curr, next) {
  // This could be a navigation that has no `to` prop. Usually a `GO_BACK`.
  if (!next) {
    return false
  }
  // If location path and query has not changed, skip it.
  return !curr || curr.pathname !== next.pathname || curr.search !== next.search
}
