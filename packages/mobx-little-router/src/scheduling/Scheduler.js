// @flow
import type { Action } from 'history'
import { TransitionFailure } from '../errors'
import createRouteStateTreeNode from '../model/createRouteStateTreeNode'
import { action, autorun, extendObservable, reaction, runInAction, when } from 'mobx'
import type RouterStore from '../model/RouterStore'
import type { Definition } from '../model/Navigation'
import Navigation from '../model/Navigation'
import TransitionManager from '../transition/TransitionManager'
import type { Event } from '../events'
import { EventTypes } from '../events'
import type { IMiddleware } from '../middleware/Middleware'
import nextEvent from './nextEvent'
import withQueryMiddleware from './util/withQueryMiddleware'
import transformEventType from '../middleware/transformEventType'

export default class Scheduler {
  disposer: null | Function
  store: RouterStore
  middleware: IMiddleware
  currentNavigation: Navigation
  event: Event

  constructor(store: RouterStore, middleware: IMiddleware) {
    extendObservable(this, {
      currentNavigation: new Navigation({
        type: 'POP',
        sequence: -1,
        to: null,
        from: null
      }),
      event: { type: EventTypes.INITIAL }
    })

    this.disposer = null
    this.store = store
    this.middleware = withQueryMiddleware
      // Run custom middleware first before handing off to our own.
      .concat(middleware)
      .concat(handleChildrenLoad)
      .concat(updateStore(store))
      .concat(handleTransitionFailure(store))
  }

  start() {
    // Watch for event changes, and dispatches the next event in the chain if it is not cancelled or ended.
    this.disposer = reaction(
      () => this.event,
      evt => {
        if (
          evt.type === EventTypes.NAVIGATION_CANCELLED ||
          evt.type === EventTypes.NAVIGATION_END
        ) {
          return
        }
        nextEvent(evt, this.store).then(next => {
          next && this.dispatch(next)
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

  schedule = action((next: Definition) => {
    if (!hasChanged(this.store.location, next.to)) return
    this.currentNavigation = this.currentNavigation.next(next)
    this.dispatch({
      type: EventTypes.NAVIGATION_START,
      navigation: this.currentNavigation
    })
  })
}

const handleChildrenLoad = transformEventType(EventTypes.CHILDREN_LOAD)(
  action(evt => {
    const { navigation, pathElements, leaf, children } = evt
    leaf.node.children.replace(children.map(createRouteStateTreeNode))

    if (navigation) {
      return {
        type: EventTypes.NAVIGATION_RETRY,
        navigation,
        pathElements,
        continueFrom: leaf
      }
    } else {
      return null
    }
  })
)

const updateStore = store =>
  transformEventType(EventTypes.NAVIGATION_AFTER_ACTIVATE)(
    action(evt => {
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
      return evt
    })
  )

const handleTransitionFailure = store =>
  transformEventType(EventTypes.NAVIGATION_ERROR)(
    action(evt => {
      const { error } = evt
      if (error instanceof TransitionFailure) {
        // Navigation error may be thrown by a guard or lifecycle hook.
        return {
          type: EventTypes.NAVIGATION_CANCELLED,
          nextNavigation: error.navigation
        }
      } else {
        // Error instances should be set on the store and an error event is emitted.
        store.setError(error)
        return evt
      }
    })
  )

function hasChanged(curr, next) {
  // If location path and query has not changed, skip it.
  return !curr || curr.pathname !== next.pathname || curr.search !== next.search
}
