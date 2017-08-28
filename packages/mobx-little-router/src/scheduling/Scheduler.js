// @flow
import type { Action } from 'history'
import { autorun, extendObservable, runInAction } from 'mobx'
import assertUrlFullyMatched from './assertUrlFullyMatched'
import type { Location, RouteNode } from '../model/types'
import type RouterStore from '../model/RouterStore'
import TransitionManager from '../transition/TransitionManager'
import areRoutesEqual from '../model/areRoutesEqual'
import shallowEqual from '../util/shallowEqual'
import shallowClone from '../model/shallowClone'
import differenceWith from '../util/differenceWith'
import { GuardFailure } from '../errors'
import type { Event } from './events'
import { EventTypes } from './events'
import Navigation from './Navigation'

export default class Scheduler {
  store: RouterStore
  transitionMgr: TransitionManager
  disposer: null | Function
  nextLocation: null | Location
  event: null | Event

  constructor(store: RouterStore) {
    this.store = store
    this.transitionMgr = new TransitionManager()
    this.disposer = null
    extendObservable(this, {
      nextLocation: null,
      event: null
    })
  }

  start() {
    this.disposer = autorun(this.processNextLocation)
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

  scheduleNavigation = (nextLocation: Location) => {
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
      this.nextLocation = {
        ...nextLocation,
        pathname
      }
    })
  }

  processNextLocation = async () => {
    const { nextLocation, store } = this
    if (!nextLocation) return

    try {
      this.emit({ type: EventTypes.NAVIGATION_START, location: nextLocation })

      // This match call may have side-effects of loading dynamic children.
      const nextPath = await store.state.pathFromRoot(
        nextLocation.pathname,
        this.handleLeafNodeReached
      )
      const nextNodes = toRouteNodes(nextPath)

      await assertUrlFullyMatched(nextLocation.pathname, nextPath)

      // We've found a match or unmatched error has been handled.
      const { activating, deactivating } = await diffActiveNodes(
        store.nodes.slice(),
        nextNodes
      )

      // Make sure we can deactivate nodes first. We need to map deactivating nodes to a MatchResult object.
      await this.checkGuards('canDeactivate', deactivating)
      await this.checkGuards('canActivate', activating)

      store.updateNodes(nextNodes)

      // Run and wait on transition of deactivating and newly activating nodes.
      await Promise.all([
        this.transitionMgr.run('leaving', deactivating),
        this.transitionMgr.run('entering', activating)
      ])

      // If all value resolved, then we're good to update store state.
      store.commit(nextLocation)
    } catch (error) {
      if (error instanceof Navigation) {
        // Navigation error may be thrown by a guard or lifecycle hook.
        this.emit({
          type: EventTypes.NAVIGATION_ABORTED,
          nextNavigation: error,
          location: nextLocation
        })
      } else if (error instanceof Error) {
        // Error instances should be set on the store and an error event is emitted.
        this.store.setError(error)
        this.emit({ type: EventTypes.NAVIGATION_ERROR, error, location: nextLocation })
      } else {
        throw new Error('Unexpected error thrown')
      }
    } finally {
      runInAction(() => {
        this.nextLocation = null
      })
      this.emit({ type: EventTypes.NAVIGATION_END, location: nextLocation })
    }
  }

  // This method tries to resolve dynamic children on the currently matching node.
  // If there are children available, load them and then continue by resolving `true`.
  // Otherwise, abort by resolving `false`. Rejection means an unexpected error.
  handleLeafNodeReached = async (lastMatchedNode: RouteNode) => {
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
  checkGuards = async (type: 'canDeactivate' | 'canActivate', nodes: RouteNode[]) => {
    for (const node of nodes) {
      const { value } = node
      const result = typeof value[type] === 'function' ? value[type](node) : true

      if (!result) {
        throw new GuardFailure(type, node)
      } else if (typeof result.then === 'function') {
        try {
          await result
        } catch (e) {
          throw new GuardFailure(type, node)
        }
      }
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

function toRouteNodes(nextPath) {
  return nextPath.map(({ node, params }) => {
    const _node = shallowClone(node)
    _node.value.params = params
    return _node
  })
}

async function diffActiveNodes(currNodes: RouteNode[], nextNodes: RouteNode[]) {
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
