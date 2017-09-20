// @flow
import { runInAction } from 'mobx'
import createRouteStateTreeNode from '../model/createRouteStateTreeNode'
import type RouterStore from '../model/RouterStore'
import { NoMatch, TransitionFailure } from '../errors'
import Navigation from '../model/Navigation'
import type { Route } from '../model/types'
import differenceWith from '../util/differenceWith'
import isUrlFullyMatched from './util/isUrlFullyMatched'
import areRoutesEqual from '../model/util/areRoutesEqual'
import TransitionManager from '../transition/TransitionManager'
import type { Event } from '../events'
import { EventTypes } from '../events'

/*
 * This function maps an Event to a new Event. It is used by the Scheduler to manage data flow.
 */

export default async function maybeProcessEvent(evt: Event, store: RouterStore): Promise<null | Event> {
  try {
    return await processEvent(evt, store)
  } catch (err) {
    return {
      type: EventTypes.NAVIGATION_ERROR,
      navigation: (evt: any).navigation,
      error: err
    }
  }
}

export async function processEvent(evt: Event, store: RouterStore): Promise<null | Event> {
  switch (evt.type) {
    case EventTypes.NAVIGATION_START: {
      const { navigation } = evt
      const matchedPath = store.state.pathFromRoot(navigation.to.pathname)
      return {
        type: EventTypes.NAVIGATION_MATCH_RESULT,
        navigation,
        matchedPath
      }
    }
    case EventTypes.NAVIGATION_RETRY: {
      const { leaf, partialPath } = evt
      const restOfPathElements = store.state.pathFrom(
        leaf.node,
        `${leaf.segment}${leaf.remaining}`
      )
      const matchedPath = partialPath.slice().concat(restOfPathElements.slice(1))
      return {
        type: EventTypes.NAVIGATION_MATCH_RESULT,
        navigation: evt.navigation,
        matchedPath
      }
    }
    case EventTypes.NAVIGATION_MATCH_RESULT: {
      const { matchedPath, navigation } = evt
      const leaf = matchedPath[matchedPath.length - 1]
      const isFullyMatched = isUrlFullyMatched(navigation.to.pathname, matchedPath)
      const loader = leaf && leaf.node.value.loadChildren
      if (!isFullyMatched && typeof loader !== 'function') {
        const caughtPath = findCatchAllPath(matchedPath, leaf)
        if (caughtPath.length > 0) {
          return {
            type: EventTypes.NAVIGATION_ACTIVATING,
            navigation: evt.navigation,
            partialPath: caughtPath,
            routes: store.getNextRoutes(caughtPath, navigation.to)
          }
        }
        return {
          type: EventTypes.NAVIGATION_ERROR,
          navigation,
          error: new NoMatch(navigation.to ? navigation.to.pathname : 'UNKNOWN_URL')
        }
      }
      if (typeof loader === 'function' && leaf.node.children.length === 0) {
        return {
          type: EventTypes.CHILDREN_CONFIG_REQUEST,
          navigation: evt.navigation,
          partialPath: matchedPath,
          leaf,
          loader
        }
      }
      return {
        type: EventTypes.NAVIGATION_ACTIVATING,
        navigation: evt.navigation,
        partialPath: matchedPath,
        routes: store.getNextRoutes(matchedPath, navigation.to)
      }
    }
    case EventTypes.CHILDREN_CONFIG_REQUEST: {
      const { navigation, leaf, partialPath, loader } = evt
      return {
        type: EventTypes.CHILDREN_CONFIG_LOAD,
        navigation,
        partialPath,
        leaf,
        module: await loader()
      }
    }
    case EventTypes.CHILDREN_CONFIG_LOAD: {
      const { navigation, partialPath, leaf, module } = evt
      if (module.length) {
        return {
          type: EventTypes.CHILDREN_LOAD,
          navigation,
          partialPath,
          leaf,
          children: module
        }
      } else {
        return {
          type: EventTypes.NAVIGATION_ERROR,
          navigation,
          error: new Error('Dynamic children function must resolve to an array.')
        }
      }
    }
    case EventTypes.CHILDREN_LOAD: {
      const { navigation, partialPath, leaf, children } = evt
      runInAction(() => {
        leaf.node.children.replace(
          children.map(x => createRouteStateTreeNode(x, leaf.node.value.getContext))
        )
        leaf.node.value.loadChildren = null
      })
      if (navigation && partialPath) {
        return {
          type: EventTypes.NAVIGATION_RETRY,
          navigation,
          partialPath,
          leaf
        }
      } else {
        return { type: EventTypes.EMPTY, navigation: evt.navigation }
      }
    }
    case EventTypes.NAVIGATION_ACTIVATING: {
      const { navigation, routes } = evt

      // We've found a match or unmatched error has been handled.
      const { activating, deactivating, entering, exiting } = diffRoutes(
        store.routes.slice(),
        routes
      )

      try {
        // Make sure we can deactivate nodes first. We need to map deactivating nodes to a MatchResult object.
        await assertTransitionOk('canDeactivate', deactivating, navigation)
        await assertTransitionOk('canActivate', activating, navigation)

        // If guards have passed, call the before hooks to give each node a chance to cancel the transition.
        await assertTransitionOk('willDeactivate', deactivating, navigation)
        await assertTransitionOk('willActivate', activating, navigation)

        await assertTransitionOk('willResolve', entering, navigation)

        return {
          type: EventTypes.NAVIGATION_ACTIVATED,
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
    case EventTypes.NAVIGATION_ACTIVATED:
      const { navigation, routes, exiting, entering } = evt
      runInAction(() => {
        store.updateRoutes(routes)
        store.updateLocation(navigation.to)
      })
      if (navigation.shouldTransition) {
        // Run and wait on transition of exiting and newly entering nodes.
        await Promise.all([
          TransitionManager.run('exiting', exiting),
          TransitionManager.run('entering', entering)
        ])
      }

      if (!navigation.cancelled) {
        return {
          type: EventTypes.NAVIGATION_END,
          navigation: evt.navigation
        }
      } else {
        return null
      }
    case EventTypes.NAVIGATION_ERROR:
      const { error } = evt
      if (error instanceof TransitionFailure) {
        // Navigation error may be thrown by a guard or lifecycle hook.
        return {
          type: EventTypes.NAVIGATION_CANCELLED,
          navigation: evt.navigation,
          nextNavigation: error.navigation
        }
      } else {
        runInAction(() => {
          store.setError(error)
        })
        return {
          type: EventTypes.NAVIGATION_END,
          navigation: evt.navigation
        }
      }
    default:
      return evt
  }
}

function diffRoutes(currRoutes: Route<*, *>[], nextRoutes: Route<*, *>[]) {
  try {
    // Deactivating this route state tree node
    const deactivating = differenceWith(
      (a, b) => {
        return a.node === b.node
      },
      currRoutes,
      nextRoutes
    ).reverse()

    // Activating this route state tree node
    const activating = nextRoutes.filter(x => {
      return !currRoutes.some(y => {
        return x.node === y.node
      })
    })

    // Exiting this specific route instance
    const exiting = differenceWith(areRoutesEqual, currRoutes, nextRoutes).reverse()

    // Entering this specific route instance
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

/*
 * Private helpers.
 */

// Runs guards (if they exist) on each node until they all pass.
// If one guard fails, then the entire function rejects.
async function assertTransitionOk(
  type:
    | 'canDeactivate'
    | 'canActivate'
    | 'willDeactivate'
    | 'willActivate'
    | 'willResolve',
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

// TODO: Take a look at doing this in a better way. Might be able to do it in the path finder?
function findCatchAllPath(matchedPath, leaf) {
  if (!leaf) {
    return []
  }
  let idx = matchedPath.length - 1
  let catchAll
  while (idx >= 0) {
    const element = matchedPath[idx]
    catchAll = element.node.children.find(x => x.value.path === '**')
    if (catchAll) {
      break
    }
    idx--
  }
  if (catchAll) {
    return matchedPath
      .slice(0, idx)
      .concat([{ node: catchAll, segment: leaf.remaining, remaining: '', params: {} }])
  }
  return []
}
