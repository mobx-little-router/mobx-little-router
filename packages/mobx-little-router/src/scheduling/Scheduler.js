// @flow
import type { Action } from 'history'
import { autorun, extendObservable, runInAction } from 'mobx'
import assertUrlFullyMatched from './assertUrlFullyMatched'
import type { MatchResult, GuardType, Location, RouteNode } from '../routing/types'
import type RouterStore from '../routing/RouterStore'
import areNodesEqual from '../routing/areNodesEqual'
import shallowEqual from '../util/shallowEqual'
import { differenceWith } from '../util/functional'
import { GuardFailure } from '../errors'
import { EventTypes } from '../events'
import type { Event } from '../events'
import maybeCallErrorHandler from './maybeCallErrorHandler'

type NavigationParams = {
  location: Location,
  action: ?Action
}

function toRouteNodes(path: MatchResult[]): RouteNode[] {
  return path.map(x => {
    x.node.value.params = x.params
    return x.node
  })
}

export default class Scheduler {
  store: RouterStore
  disposer: null | Function
  navigation: null | NavigationParams
  event: null | Event

  constructor(store: RouterStore) {
    this.store = store
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
      const path: MatchResult[] = await this.store.state.pathFromRoot(
        location.pathname,
        this.handleChildNodesExhausted
      )

      await assertUrlFullyMatched(location.pathname, path)

      // We've found a match or unmatched error has been handled.
      await this.runPathActivation(path)

      // If all hooks resolved, then we're good to update store state.
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

  runPathActivation = async (activating: MatchResult[]) => {
    try {
      const deactivating = differenceWith(
        areNodesEqual,
        this.store.nodes.slice(),
        activating.map(x => x.node)
      )
        .map(node => ({
          node,
          remaining: '',
          params: node.value.params || {}
        }))
        .reverse()

      // We don't need to activate nodes that are already active
      const newlyActivating = activating.filter(x => {
        return !this.store.nodes.some(y => {
          return areNodesEqual(x.node, y)
        })
      })

      // Make sure we can deactivate nodes first. We need to map deactivating nodes to a MatchResult object.
      await this.guardOnHook('canDeactivate', [], deactivating)
      await this.guardOnHook('canActivate', [], newlyActivating)

      this.store.updateNodes(toRouteNodes(activating))

      // Run and wait on both leave and enter hooks.
      // TODO: Consider whether ordering here matters. Do we need to guarantee that leave is called before all enter?
      await Promise.all([
        this.guardOnHook('onLeave', [], deactivating),
        this.guardOnHook('onEnter', [], newlyActivating)
      ])
    } catch (err) {
      // Make sure we chain errors back up!
      throw err
    }
  }

  guardOnHook = async (
    type: GuardType,
    processed: MatchResult[],
    remaining: MatchResult[]
  ) => {
    const [curr, ...rest] = remaining

    // Done!
    if (!curr) {
      return
    }

    const { params, node } = curr
    const { value: { hooks } } = node

    const guard =
      hooks[type] &&
      hooks[type].reduce((acc, f) => {
        return acc.then(() =>
          f(node, params).catch(error => {
            throw new GuardFailure(error, node, params)
          })
        )
      }, Promise.resolve())

    try {
      await guard
      // Run the next guards.
      await this.guardOnHook(type, [curr], rest)
    } catch (err) {
      // When we encounter a failed guard, just stop navigation.
      throw err
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
