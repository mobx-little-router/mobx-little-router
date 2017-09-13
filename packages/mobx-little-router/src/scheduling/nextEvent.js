// @flow
import createRouteStateTreeNode from '../model/createRouteStateTreeNode'
import type RouterStore from '../model/RouterStore'
import { NoMatch, TransitionFailure } from '../errors'
import Navigation from '../model/Navigation'
import type { Route } from '../model/types'
import differenceWith from '../util/differenceWith'
import isUrlFullyMatched from './util/isUrlFullyMatched'
import areRoutesEqual from '../model/util/areRoutesEqual'
import { EventTypes } from '../events'
import type { Event } from '../events'

export default async function nextEvent(evt: Event, store: RouterStore): Promise<null | Event> {
  switch (evt.type) {
    case EventTypes.NAVIGATION_START: {
      const { navigation } = evt
      const { to: nextLocation } = navigation
      if (!nextLocation) {
        return null
      }
      const nextPath = store.state.pathFromRoot(nextLocation.pathname)
      if (isUrlFullyMatched(nextLocation.pathname, nextPath)) {
        return {
          type: EventTypes.NAVIGATION_BEFORE_ACTIVATE,
          navigation: evt.navigation,
          routes: store.getNextRoutes(nextPath, nextLocation)
        }
      } else {
        return {
          type: EventTypes.PATH_NOT_FOUND,
          navigation: evt.navigation,
          pathElements: nextPath
        }
      }
    }
    case EventTypes.PATH_NOT_FOUND: {
      const { navigation, pathElements } = evt
      const leaf = pathElements[pathElements.length - 1]

      if (leaf && typeof leaf.node.value.loadChildren === 'function') {
        return {
          type: EventTypes.CHILDREN_CONFIG_LOAD,
          navigation,
          pathElements,
          module: await leaf.node.value.loadChildren(),
          leaf
        }
      } else {
        return {
          type: EventTypes.NAVIGATION_ERROR,
          navigation,
          error: new NoMatch(navigation.to ? navigation.to.pathname : 'UNKNOWN_URL')
        }
      }
    }
    case EventTypes.CHILDREN_CONFIG_LOAD: {
      const { navigation, pathElements, leaf, module  } = evt
      if (module.length) {
        return {
          type: EventTypes.CHILDREN_LOAD,
          navigation,
          pathElements,
          leaf,
          children: module.map(createRouteStateTreeNode)
        }
      } else {
        return {
          type: EventTypes.NAVIGATION_ERROR,
          navigation,
          error: new Error('Dynamic children function must resolve to an array.')
        }
      }
    }
    case EventTypes.NAVIGATION_RETRY: {
      const { navigation, continueFrom, pathElements } = evt
      const { to: nextLocation } = navigation
      const restOfPathElements = store.state.pathFrom(continueFrom.node, `${continueFrom.segment}${continueFrom.remaining}`)
      const nextPath = pathElements.slice().concat(restOfPathElements.slice(1))
      if (nextLocation && isUrlFullyMatched(nextLocation.pathname, nextPath)) {
        return {
          type: EventTypes.NAVIGATION_BEFORE_ACTIVATE,
          navigation: evt.navigation,
          routes: store.getNextRoutes(nextPath, nextLocation)
        }
      } else {
        return {
          type: EventTypes.PATH_NOT_FOUND,
          navigation: evt.navigation,
          pathElements: nextPath
        }
      }
    }
    case EventTypes.NAVIGATION_BEFORE_ACTIVATE: {
      const { navigation, routes } = evt

      // We've found a match or unmatched error has been handled.
      const {
        activating,
        deactivating,
        entering,
        exiting
      } = diffRoutes(store.routes.slice(), routes)

      try {
        // Make sure we can deactivate nodes first. We need to map deactivating nodes to a MatchResult object.
        await assertTransitionOk('canDeactivate', deactivating, navigation)
        await assertTransitionOk('canActivate', activating, navigation)

        // If guards have passed, call the before hooks to give each node a chance to cancel the transition.
        await assertTransitionOk('willDeactivate', deactivating, navigation)
        await assertTransitionOk('willActivate', activating, navigation)

        await assertTransitionOk('willResolve', entering, navigation)

        return {
          type: EventTypes.NAVIGATION_AFTER_ACTIVATE,
          navigation,
          entering,
          exiting,
          routes
        }
      } catch (err) {
        return {
          type: EventTypes.NAVIGATION_ERROR,
          navigation,
          error: err
        }
      }
    }
    case EventTypes.NAVIGATION_AFTER_ACTIVATE:
      return {
        type: EventTypes.NAVIGATION_END,
        navigation: evt.navigation
      }
    case EventTypes.NAVIGATION_ERROR:
      const { error } = evt
      if (error instanceof TransitionFailure) {
        // Navigation error may be thrown by a guard or lifecycle hook.
        return {
          type: EventTypes.NAVIGATION_CANCELLED,
          nextNavigation: error.navigation
        }
      } else {
        return {
          type: EventTypes.NAVIGATION_END,
          navigation: evt.navigation
        }
      }
    default:
      return null
  }
}

function diffRoutes(currRoutes: Route<*, *>[], nextRoutes: Route<*, *>[]) {
  try {
    // Deactivating this route state tree node
    const deactivating = differenceWith((a, b) => {
      return a.node === b.node
    }, currRoutes, nextRoutes).reverse()

    // Activating this route state tree node
    const activating = nextRoutes.filter(x => {
      return !currRoutes.some(y => {
        return x.node === y.node
      })
    })

    // Exiting this specific route instance
    const exiting = differenceWith(areRoutesEqual, currRoutes, nextRoutes).reverse()

    // Entering this spectic route instance
    const entering = nextRoutes.filter(x => {
      return !currRoutes.some(y => {
        return areRoutesEqual(x, y)
      })
    })

    return { activating, deactivating, entering, exiting }
  } catch (err) {
    // Make sure we chain errors back up!
    throw err
  }
}

// Runs guards (if they exist) on each node until they all pass.
// If one guard fails, then the entire function rejects.
async function assertTransitionOk(
  type: 'canDeactivate' | 'canActivate' | 'willDeactivate' | 'willActivate' | 'willResolve',
  routes: Route<*, *>[],
  navigation: Navigation
): Promise<void> {
  for (const route of routes) {
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
