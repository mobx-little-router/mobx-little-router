// @flow
import { action } from 'mobx'
import createRouteStateTreeNode from '../model/createRouteStateTreeNode'
import type RouterStore from '../model/RouterStore'
import { NoMatch, TransitionFailure } from '../errors'
import Navigation from '../model/Navigation'
import type { Route, Setter } from '../model/types'
import differenceWith from '../util/differenceWith'
import isUrlFullyMatched from './util/isUrlFullyMatched'
import areRoutesEqual from '../model/util/areRoutesEqual'
import TransitionManager from '../transition/TransitionManager'
import type { Event } from '../events'
import { EventTypes } from '../events'

/*
 * This function maps an Event to a new Event. It is used by the Scheduler to manage data flow.
 */

export default async function maybeProcessEvent(
  evt: Event,
  store: RouterStore
): Promise<Event> {
  try {
    const next = await processEvent(evt, store)
    if (next) {
      if (store.isCancelled(next.navigation)) {
        return { type: EventTypes.EMPTY, navigation: null }
      } else {
        // Any setters returned after willResolve is called here.
        if (typeof next.setter === 'function') {
          next.setter()
        }
        return next
      }
    } else {
      return { type: EventTypes.EMPTY, navigation: null }
    }
  } catch (err) {
    return {
      type: EventTypes.NAVIGATION_ERROR,
      navigation: evt && evt.navigation,
      error: err,
      done: true
    }
  }
}

export async function processEvent(
  evt: Event,
  store: RouterStore
): Promise<null | Event> {
  switch (evt.type) {
    case EventTypes.NAVIGATION_START: {
      const { navigation } = evt
      const matchedPath = store.state.pathFromRoot(navigation.to.pathname)
      return {
        type: EventTypes.NAVIGATION_RESULT_MATCHED,
        navigation,
        matchedPath
      }
    }
    case EventTypes.NAVIGATION_RETRY: {
      const { leaf, partialPath } = evt
      const restOfPathElements = store.state.pathFrom(
        leaf.node,
        `${leaf.segment}${leaf.remaining}`,
        leaf.params
      )
      const matchedPath = partialPath.slice().concat(restOfPathElements.slice(1))
      return {
        type: EventTypes.NAVIGATION_RESULT_MATCHED,
        navigation: evt.navigation,
        matchedPath
      }
    }
    case EventTypes.NAVIGATION_RESULT_MATCHED: {
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
          error: new NoMatch(navigation.to ? navigation.to.pathname : 'UNKNOWN_URL'),
          done: true
        }
      }
      if (typeof loader === 'function' && leaf.node.children.length === 0) {
        return {
          type: EventTypes.CHILDREN_CONFIG_REQUESTED,
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
    case EventTypes.CHILDREN_CONFIG_REQUESTED: {
      const { navigation, leaf, partialPath, loader } = evt
      return {
        type: EventTypes.CHILDREN_CONFIG_LOADED,
        navigation,
        partialPath,
        leaf,
        module: await loader()
      }
    }
    case EventTypes.CHILDREN_CONFIG_LOADED: {
      const { navigation, partialPath, leaf, module } = evt
      const children = typeof module.default === 'object' ? module.default : module
      if (children.length) {
        return {
          type: EventTypes.CHILDREN_LOADING,
          navigation,
          partialPath,
          root: store.state.root,
          leaf,
          children
        }
      } else {
        return {
          type: EventTypes.NAVIGATION_ERROR,
          navigation,
          error: new Error('Dynamic children function must resolve to an array.'),
          done: true
        }
      }
    }
    case EventTypes.CHILDREN_LOADING: {
      const { navigation, partialPath, leaf, children } = evt
      return {
        type: EventTypes.CHILDREN_LOADED,
        navigation,
        partialPath,
        leaf,
        root: store.state.root,
        setter: action(() => {
          leaf.node.children.replace(
            children.map(x => createRouteStateTreeNode(x, leaf.node.value.getContext))
          )
          leaf.node.value.loadChildren = null
        })
      }
    }
    case EventTypes.CHILDREN_LOADED: {
      const { navigation, partialPath, leaf } = evt
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

        const setter: void | Function = await assertTransitionOk(
          'willResolve',
          entering,
          navigation
        )
        return {
          type: EventTypes.NAVIGATION_ACTIVATED,
          navigation,
          entering,
          exiting,
          routes,
          setter
        }
      } catch (err) {
        if (err instanceof TransitionFailure) {
          // Navigation error may be thrown by a guard or lifecycle hook.
          return {
            type: EventTypes.NAVIGATION_CANCELLED,
            navigation: evt.navigation,
            nextNavigation: err.navigation,
            done: true
          }
        } else {
          return {
            type: EventTypes.NAVIGATION_ERROR,
            navigation,
            error: err,
            done: true
          }
        }
      }
    }
    case EventTypes.NAVIGATION_ACTIVATED: {
      const { navigation, routes, exiting, entering } = evt
      return {
        type: EventTypes.NAVIGATION_TRANSITION_START,
        navigation: evt.navigation,
        routes,
        entering,
        exiting,
        setter: action(() => {
          store.updateRoutes(routes)
          store.updateLocation(navigation.to)
        })
      }
    }
    case EventTypes.NAVIGATION_TRANSITION_START: {
      const { navigation, routes, exiting, entering } = evt
      if (navigation.shouldTransition) {
        // Run and wait on transition of exiting and newly entering nodes.
        await Promise.all([
          TransitionManager.run('exiting', exiting),
          TransitionManager.run('entering', entering)
        ])
      }

      return {
        type: EventTypes.NAVIGATION_TRANSITION_END,
        navigation: evt.navigation,
        routes,
        entering,
        exiting
      }
    }
    case EventTypes.NAVIGATION_TRANSITION_END: {
      return {
        type: EventTypes.NAVIGATION_END,
        navigation: evt.navigation,
        done: true
      }
    }
    case EventTypes.NAVIGATION_ERROR: {
      return null
    }
    case EventTypes.NAVIGATION_CANCELLED:{
      return {
        type: EventTypes.EMPTY,
        navigation: evt.navigation,
        setter: () => {
          store.cancel(evt.navigation)
          store.clearPrevRoutes()
        }
      }
    }
    case EventTypes.NAVIGATION_END: {
      return {
        type: EventTypes.EMPTY,
        navigation: evt.navigation,
        setter: () => {
          store.clearPrevRoutes()
        }
      }
    }
    default:
      return evt
  }
}

/*
 * Private helpers.
 */

function diffRoutes(currRoutes: Route<*, *>[], nextRoutes: Route<*, *>[]) {
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
}

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
): Promise<void | Setter> {
  const setters = []
  for (const route of routes) {
    const { value } = route.node
    const result = typeof value[type] === 'function'
      ? value[type](route, navigation)
      : true

    // If the guard results in `false` or a rejected promise then mark transition as failed.
    try {
      if (false === result) {
        await navigation.goBack()
      } else if (typeof result.then === 'function') {
        const x = await result
        if (typeof x === 'function') {
          setters.push(x)
        }
      }
    } catch (e) {
      throw new TransitionFailure(route, e instanceof Navigation ? e : null)
    }
  }
  return () => setters.forEach(f => f())
}

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
