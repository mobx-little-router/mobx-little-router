// @flow
import type { Action } from 'history'
import { autorun, extendObservable, runInAction } from 'mobx'
import type { RouteStateTreeNode, Route } from '../model/types'
import type RouterStore from '../model/RouterStore'
import createRoute from '../model/createRoute'
import areRoutesEqual from '../model/util/areRoutesEqual'
import Navigation from '../model/Navigation'
import type { Definition } from '../model/Navigation'
import TransitionManager from '../transition/TransitionManager'
import shallowEqual from '../util/shallowEqual'
import differenceWith from '../util/differenceWith'
import { TransitionFailure } from '../errors/index'
import type { Event } from './events'
import { EventTypes } from './events'
import assertUrlFullyMatched from './util/assertUrlFullyMatched'

export default class Scheduler {
  store: RouterStore
  disposer: null | Function
  currentNavigation: null | Navigation
  event: null | Event

  constructor(store: RouterStore) {
    this.store = store
    this.disposer = null
    extendObservable(this, {
      currentNavigation: null,
      event: null
    })
  }

  start() {
    this.disposer = autorun(this.processNextNavigation)
  }

  stop() {
    this.disposer && this.disposer()
    this.disposer = null
  }

  // Emit navigation events.
  emit(evt: Event) {
    runInAction(() => {
      this.event = evt
    })
  }

  scheduleNavigation = (next: Definition) => {
    const { location } = this.store

    // This could be a navigation that has no `to` prop. Usually a `GO_BACK`.
    if (!next.to) {
      return
    }

    // If location path and query has not changed, skip it.
    if (
      location &&
      location.pathname === next.to.pathname &&
      location.query &&
      shallowEqual(location.query, next.to.query)
    ) {
      return
    }

    runInAction(() => {
      const { currentNavigation } = this
      this.store.error = null

      this.currentNavigation = currentNavigation
        ? currentNavigation.next(next)
        : new Navigation({
            ...next,
            from: location || null
          })
    })
  }

  processNextNavigation = async () => {
    const { currentNavigation, store } = this
    if (!currentNavigation) return

    const { to: nextLocation } = currentNavigation
    if (!nextLocation) return

    try {
      this.emit({ type: EventTypes.NAVIGATION_START, navigation: currentNavigation })

      // This match call may have side-effects of loading dynamic children.
      const nextPath = await store.state.pathFromRoot(
        nextLocation.pathname,
        this.handleLeafNodeReached
      )
      const nextRoutes = toRoutes(this.store, nextPath)

      await assertUrlFullyMatched(nextLocation.pathname, nextPath)

      // We've found a match or unmatched error has been handled.
      const { activating, deactivating } = await diffActiveNodes(
        store.routes.slice(),
        nextRoutes
      )

      // Make sure we can deactivate nodes first. We need to map deactivating nodes to a MatchResult object.
      await this.assertTransitionOk('canDeactivate', deactivating, currentNavigation)
      await this.assertTransitionOk('canActivate', activating, currentNavigation)

      // If guards have passed, call the before hooks to give each node a chance to cancel the transition.
      await this.assertTransitionOk('willDeactivate', deactivating, currentNavigation)
      await this.assertTransitionOk('willActivate', activating, currentNavigation)

      this.emit({ type: EventTypes.NAVIGATION_ACTIVATING, navigation: currentNavigation })

      store.updateRoutes(nextRoutes)

      // Run and wait on transition of deactivating and newly activating nodes.
      await Promise.all([
        TransitionManager.run('deactivating', deactivating),
        TransitionManager.run('activating', activating)
      ])

      // If all value resolved, then we're good to update store state.
      store.commit(nextLocation)
    } catch (error) {
      if (error instanceof TransitionFailure) {
        // Navigation error may be thrown by a guard or lifecycle hook.
        this.emit({
          type: EventTypes.NAVIGATION_CANCELLED,
          nextNavigation: error.navigation
        })
      } else {
        // Error instances should be set on the store and an error event is emitted.
        this.store.setError(error)
        this.emit({
          type: EventTypes.NAVIGATION_ERROR,
          error,
          navigation: currentNavigation
        })
      }
    } finally {
      this.emit({ type: EventTypes.NAVIGATION_END, navigation: currentNavigation })
    }
  }

  // This method tries to resolve dynamic children on the currently matching node.
  // If there are children available, load them and then continue by resolving `true`.
  // Otherwise, abort by resolving `false`. Rejection means an unexpected error.
  handleLeafNodeReached = async (lastMatchedNode: RouteStateTreeNode<*, *>) => {
    // If there are dynamic children, try to load and continue.
    if (typeof lastMatchedNode.value.loadChildren === 'function') {
      const children = await lastMatchedNode.value.loadChildren()
      runInAction(() => {
        lastMatchedNode.children.replace(children)
      })
      return true
    } else {
      return false
    }
  }

  // Runs guards (if they exist) on each node until they all pass.
  // If one guard fails, then the entire function rejects.
  assertTransitionOk = async (
    type: 'canDeactivate' | 'canActivate' | 'willDeactivate' | 'willActivate',
    Routes: Route<*, *>[],
    navigation: Navigation
  ): Promise<void> => {
    for (const route of Routes) {
      const { value } = route.node
      const result = typeof value[type] === 'function'
        ? value[type](route, navigation)
        : true

      try {
        if (false === result) {
          await navigation.goBack()
        } else if (typeof result.then === 'function') {
          await result
        }
      } catch (e) {
        throw new TransitionFailure(route, e instanceof Navigation ? e : null)
      }
    }
  }
}

// Get the existing Route from store (if segment remains the same), otherwise build new one.
function toRoutes(store, nextPath) {
  return nextPath.map(({ node, params, segment }) => {
    const existing = store.routes.find(x => {
      return x.key === node.value.key
    })
    return existing || createRoute(node, params, segment)
  })
}

async function diffActiveNodes(
  currNodes: Route<*, *>[],
  nextNodes: Route<*, *>[]
) {
  try {
    const deactivating = differenceWith(areRoutesEqual, currNodes, nextNodes).reverse()

    const activating = nextNodes.filter(x => {
      return !currNodes.some(y => {
        return areRoutesEqual(x, y)
      })
    })

    return { deactivating, activating }
  } catch (err) {
    // Make sure we chain errors back up!
    throw err
  }
}
