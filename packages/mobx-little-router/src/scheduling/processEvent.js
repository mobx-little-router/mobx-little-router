// @flow
import { action } from 'mobx'
import createRouteStateTreeNode from '../model/createRouteStateTreeNode'
import type RouterStore from '../model/RouterStore'
import { NoMatch } from '../errors'
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
        leaf.params,
        leaf.parentUrl
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
          leaf.node.children.replace(children.map(x => store.createNode(leaf.node, x)))
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

      // Add matched leaf to the navigation object so it can be used for redirection
      navigation.leaf = routes[routes.length - 1]

      try {
        await evalTransitionsForRoutes(
          ['canDeactivate', 'willDeactivate'],
          deactivating,
          navigation
        )
        const s1 = await evalTransitionsForRoutes(
          ['canActivate', 'willActivate', 'willResolve'],
          activating,
          navigation
        )
        const s2: Function = await evalTransitionsForRoutes(
          ['willResolve'],
          entering.filter(x => !activating.includes(x)), // Don't run `willResolve` if activation ran it already.
          navigation
        )
        return {
          type: EventTypes.NAVIGATION_ACTIVATED,
          navigation,
          entering,
          exiting,
          routes,
          setter: () => {
            s1()
            s2()
          }
        }
      } catch (err) {
        // Navigation error may be thrown by a guard or lifecycle hook.
        // If so, mark the current navigation as cancelled, and use the error Navigation as next.
        if (err instanceof Navigation) {
          return {
            type: EventTypes.NAVIGATION_CANCELLED,
            navigation: evt.navigation,
            nextNavigation: err,
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
    case EventTypes.NAVIGATION_CANCELLED: {
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

type TransitionType =
  | 'canDeactivate'
  | 'canActivate'
  | 'willDeactivate'
  | 'willActivate'
  | 'willResolve'

async function evalTransition(
  type: TransitionType,
  route: Route<*, *>,
  navigation: Navigation
): Promise<void | Function> {
  const { value } = route.node
  const result = typeof value[type] === 'function' ? value[type](route, navigation) : true

  // If the guard results in `false` or a rejected promise then mark transition as failed.
  if (false === result) {
    await navigation.goBack() // TODO: This `goBack` will not work if this is the first navigation in the system.
  } else if (typeof result.then === 'function') {
    const x = await result
    if (typeof x === 'function') {
      return x
    }
  }
}

async function evalTransitions(
  types: TransitionType[],
  route: Route<*, *>,
  navigation: Navigation
) {
  const setters = []
  for (const type of types) {
    const setter = await evalTransition(type, route, navigation)
    if (typeof setter === 'function') {
      setters.push(setter)
    }
  }
  return () => setters.forEach(f => f())
}

async function evalTransitionsForRoutes(
  types: TransitionType[],
  routes: Route<*, *>[],
  navigation: Navigation
) {
  const setters = []
  for (const route of routes) {
    const setter = await evalTransitions(types, route, navigation)
    if (typeof setter === 'function') {
      setters.push(setter)
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
    return matchedPath.slice(0, idx).concat([
      {
        node: catchAll,
        parentUrl: leaf.parentUrl,
        segment: leaf.remaining,
        remaining: '',
        params: {}
      }
    ])
  }
  return []
}
