// @flow
import type { Action } from 'history'
import { autorun, extendObservable, runInAction } from 'mobx'
import assertUrlFullyMatched from './assertUrlFullyMatched'
import type { Location, RouteNode } from '../routing/types'
import type RouterStore from '../routing/RouterStore'
import TransitionManager from '../transitions/TransitionManager'
import areNodesEqual from '../routing/areNodesEqual'
import shallowEqual from '../util/shallowEqual'
import { differenceWith } from '../util/functional'
import { GuardFailure } from '../errors'
import { EventTypes } from '../events'
import type { Event } from '../events'

type NavigationParams = {
  location: Location,
  action: ?Action
}

export default class Scheduler {
  store: RouterStore
  transitionMgr: TransitionManager
  disposer: null | Function
  navigation: null | NavigationParams
  event: null | Event

  constructor(store: RouterStore) {
    this.store = store
    this.transitionMgr = new TransitionManager()
    this.disposer = null
    extendObservable(this, {
      navigation: null,
      event: null
    })
  }

  start() {
    this.disposer = autorun(this.processNavigation)
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

  scheduleNavigation = (nextLocation: Location, action: ?Action) => {
    const { location } = this.store

    // If location path and query has not changed, skip it.
    if (
      location &&
      location.pathname === nextLocation.pathname &&
      location.query &&
      shallowEqual(location.query, nextLocation.query)
    ) {
      return
    }

    const pathname = normalizePath(nextLocation.pathname)

    runInAction(() => {
      this.store.error = null
      this.navigation = {
        location: {
          ...nextLocation,
          pathname
        },
        action
      }
    })
  }

  clearNavigation() {
    runInAction(() => {
      this.navigation = null
    })
  }

  processNavigation = async () => {
    const { navigation } = this
    if (!navigation) return

    const { location } = navigation

    try {
      this.emit({ type: EventTypes.NAVIGATION_START, location })

      // This match call may have side-effects of loading dynamic children.
      const nextPath = await this.store.state.pathFromRoot(
        location.pathname,
        this.handleChildNodesExhausted
      )
      const nextNodes = nextPath.map(x => x.node)

      await assertUrlFullyMatched(location.pathname, nextPath)

      // We've found a match or unmatched error has been handled.
      await this.activate(nextNodes)

      // If all value resolved, then we're good to update store state.
      this.store.commit(location)
    } catch (error) {
      this.store.setError(error)
      this.emit({ type: EventTypes.NAVIGATION_ERROR, error, location })
    } finally {
      this.clearNavigation()
      this.emit({ type: EventTypes.NAVIGATION_END, location })
    }
  }

  // This method tries to resolve dynamic children on the currently matching node.
  // If there are children available, load them and then continue by resolving `true`.
  // Otherwise, abort by resolving `false`. Rejection means an unexpected error.
  handleChildNodesExhausted = async (lastMatchedNode: RouteNode) => {
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

  activate = async (activating: RouteNode[]) => {
    try {
      const deactivating = differenceWith(
        areNodesEqual,
        this.store.nodes.slice(),
        activating.slice()
      ).reverse()

      // We don't need to activate nodes that are already active
      const newlyActivating = activating.filter(x => {
        return !this.store.nodes.some(y => {
          return areNodesEqual(x, y)
        })
      })

      // Make sure we can deactivate nodes first. We need to map deactivating nodes to a MatchResult object.
      await this.runGuard('canDeactivate', deactivating)
      await this.runGuard('canActivate', newlyActivating)

      this.store.updateNodes(activating)

      // Run and wait on transition of deactivating and newly activating nodes.
      await Promise.all([
        this.transitionMgr.run('leaving', deactivating),
        this.transitionMgr.run('entering', newlyActivating)
      ])
    } catch (err) {
      // Make sure we chain errors back up!
      throw err
    }
  }

  // Runs guards (if they exist) on each node until they all pass.
  // If one guard fails, then the entire function rejects.
  runGuard = async (type: 'canDeactivate' | 'canActivate', nodes: RouteNode[]) => {
    for (const node of nodes) {
      const { value } = node
      const promise = typeof value[type] === 'function'
        ? value[type](node)
        : Promise.resolve()
      const guard =
        promise !== undefined &&
        promise.catch(error => {
          throw new GuardFailure(error, node)
        })
      await guard
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
