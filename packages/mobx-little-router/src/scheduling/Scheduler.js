// @flow
import type { Action } from 'history'
import { autorun, extendObservable, runInAction } from 'mobx'
import assertPathFullyMatched from '../matching/assertPathFullyMatched'
import type { MatchResult } from '../matching/types'
import type { HookType, Location, RouteNode } from '../routing/types'
import type RouterStore from '../routing/RouterStore'
import areNodesEqual from '../routing/areNodesEqual'
import shallowEqual from '../util/shallowEqual'
import { differenceWith } from '../util/functional'
import { GuardFailure } from '../errors'

type NavigationParams = {
  location: Location,
  segments: string[],
  action: ?Action
}

function toActiveNodes(path) {
  return path.map(x => {
    x.node.value.params = x.params
    return x.node
  })
}
export default class Scheduler {
  store: RouterStore
  disposer: null | Function
  navigation: null | NavigationParams

  constructor(store: RouterStore) {
    this.store = store
    this.disposer = null
    extendObservable(this, {
      navigation: null
    })
  }

  start() {
    this.disposer = autorun(this.processNavigation)
  }

  stop() {
    this.disposer && this.disposer()
    this.disposer = null
  }

  scheduleTransition = async (callback: (continueTransition: boolean) => void) => {
    callback(true)
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
      this.navigation = {
        location: {
          ...nextLocation,
          pathname
        },
        segments: pathname.split('/'),
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

    if (!navigation) {
      return
    }

    const { location, segments } = navigation

    try {
      // This match call may have side-effects of loading dynamic children.
      // TODO: Perhaps there is a better way to break the side-effect out of the path search?
      const path: MatchResult[] = await this.store.state.pathFromRoot(
        segments,
        this.maybeLoadRouteNodeChildren
      )

      await assertPathFullyMatched(segments, path)
      await this.tryActivate(path)

      // Commit the navigation.
      this.store.setLocation(location)
      this.store.setActiveNodes(toActiveNodes(path))
    } catch (err) {
      this.store.setError(err)
    } finally {
      this.clearNavigation()
    }
  }

  maybeLoadRouteNodeChildren = async (node: RouteNode) => {
    if (node.value.loadChildren !== null) {
      return false
    } else {
      return false
    }
  }

  tryActivate = async (activating: MatchResult[]) => {
    try {
      const deactivating = differenceWith(
        areNodesEqual,
        this.store.activeNodes.slice(),
        activating.map(x => x.node)
      )
        .map(node => ({
          node,
          segment: '',
          params: node.value.params || {}
        }))
        .reverse()

      // Make sure we can deactivate nodes first. We need to map deactivating nodes to a MatchResult object.
      await this.runGuards('canDeactivate', [], deactivating)
      await this.runGuards('canActivate', [], activating)
      // await this.runGuards(['onLeave', 'onEnter'], [], activating)
    } catch (err) {
      // Make sure we chain errors back up!
      throw err
    }
  }

  runGuards = async (
    type: HookType,
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
      await this.runGuards(type, [curr], rest)
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
