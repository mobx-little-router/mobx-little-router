// @flow
import { action } from 'mobx'
import type RouterStore from '../model/RouterStore'
import { NotFound } from '../errors'
import Navigation from '../model/Navigation'
import type { Route } from '../model/types'
import isUrlFullyMatched from './util/isUrlFullyMatched'
import areRoutesEqual from '../model/util/areRoutesEqual'
import TransitionManager from '../transition/TransitionManager'
import type { Event } from '../events'
import { EventTypes } from '../events'
import { RouteError } from '../errors'

/*
 * This function maps an Event to a new Event. It is used by the Scheduler to manage data flow.
 */

export default function maybeProcessEvent(
  evt: Event,
  store: RouterStore
): Promise<Event> {
  try {
    return processEvent(evt, store)
      .then(next => {
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
      })
      .catch(err => {
        return {
          type: EventTypes.NAVIGATION_ERROR,
          navigation: evt && evt.navigation,
          error: err,
          done: true
        }
      })
  } catch (err) {
    return Promise.resolve({
      type: EventTypes.NAVIGATION_ERROR,
      navigation: evt && evt.navigation,
      error: err,
      done: true
    })
  }
}

function normalizePath(x: string) {
  return x.endsWith('/') ? x : `${x}/`
}

export function processEvent(evt: Event, store: RouterStore): Promise<null | Event> {
  switch (evt.type) {
    case EventTypes.NAVIGATION_START: {
      const { navigation } = evt
      const matchedPath = store.state.pathFromRoot(normalizePath(navigation.to.pathname))
      return Promise.resolve({
        type: EventTypes.NAVIGATION_RESULT_MATCHED,
        navigation,
        matchedPath
      })
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
      return Promise.resolve({
        type: EventTypes.NAVIGATION_RESULT_MATCHED,
        navigation: evt.navigation,
        matchedPath
      })
    }
    case EventTypes.NAVIGATION_RESULT_MATCHED: {
      const { matchedPath, navigation } = evt
      const leaf = matchedPath[matchedPath.length - 1]
      const isFullyMatched = isUrlFullyMatched(navigation.to.pathname, matchedPath)
      const loader = leaf && leaf.node.value.loadChildren

      if (!isFullyMatched && typeof loader !== 'function') {
        const caughtPath = findCatchAllPath(matchedPath)
        if (caughtPath.length > 0) {
          return Promise.resolve({
            type: EventTypes.NAVIGATION_ACTIVATING,
            navigation: evt.navigation,
            partialPath: caughtPath,
            routes: store.getNextRoutes(caughtPath, navigation.to)
          })
        }
        return Promise.resolve({
          type: EventTypes.NAVIGATION_ERROR,
          navigation,
          error: new NotFound(navigation),
          done: true
        })
      }
      
      if (typeof loader === 'function' && leaf.node.children.length === 0) {
        return Promise.resolve({
          type: EventTypes.CHILDREN_CONFIG_REQUESTED,
          navigation: evt.navigation,
          partialPath: matchedPath,
          leaf,
          loader
        })
      }

      if (isCatchAll(leaf && leaf.node)) {
        store.updateError(new NotFound(navigation))
      }

      return Promise.resolve({
        type: EventTypes.NAVIGATION_ACTIVATING,
        navigation: evt.navigation,
        partialPath: matchedPath,
        routes: store.getNextRoutes(matchedPath, navigation.to)
      })
    }
    case EventTypes.CHILDREN_CONFIG_REQUESTED: {
      const { navigation, leaf, partialPath, loader } = evt
      return loader().then(module => ({
        type: EventTypes.CHILDREN_CONFIG_LOADED,
        navigation,
        partialPath,
        leaf,
        module
      }))
    }
    case EventTypes.CHILDREN_CONFIG_LOADED: {
      const { navigation, partialPath, leaf, module } = evt
      const children = typeof module.default === 'object' ? module.default : module
      if (children.length) {
        return Promise.resolve({
          type: EventTypes.CHILDREN_LOADING,
          navigation,
          partialPath,
          root: store.state.root,
          leaf,
          children
        })
      } else {
        return Promise.resolve({
          type: EventTypes.NAVIGATION_ERROR,
          navigation,
          error: new Error('Dynamic children function must resolve to an array.'),
          done: true
        })
      }
    }
    case EventTypes.CHILDREN_LOADING: {
      const { navigation, partialPath, leaf, children } = evt
      return Promise.resolve({
        type: EventTypes.CHILDREN_LOADED,
        navigation,
        partialPath,
        leaf,
        root: store.state.root,
        setter: action(() => {
          store.replaceChildren(leaf.node, children)
          leaf.node.value.loadChildren = null
        })
      })
    }
    case EventTypes.CHILDREN_LOADED: {
      const { navigation, partialPath, leaf } = evt
      if (navigation && partialPath) {
        return Promise.resolve({
          type: EventTypes.NAVIGATION_RETRY,
          navigation,
          partialPath,
          leaf
        })
      } else {
        return Promise.resolve({ type: EventTypes.EMPTY, navigation: evt.navigation })
      }
    }
    case EventTypes.NAVIGATION_ACTIVATING: {
      const { navigation, routes, partialPath } = evt

      const currRoutes = store.routes.slice()

      // We've found a match or unmatched error has been handled.
      const { activating, deactivating, entering, exiting } = diffRoutes(
        currRoutes,
        routes
      )

      // Add matched leaf to the navigation object so it can be used for redirection
      navigation.leaf = routes[routes.length - 1]

      return evalTransitionsForRoutes(
        [
          { type: 'canDeactivate' },
          { type: 'willDeactivate' }
        ],
        deactivating,
        navigation
      ).then(() =>
        evalTransitionsForRoutes(
          [
            { type: 'canActivate', includes: activating },
            { type: 'willActivate', includes: activating },
            { type: 'willResolve', includes: entering }
          ],
          routes,
          navigation
        ).then((setter: Function) => ({
          type: EventTypes.NAVIGATION_ACTIVATED,
          navigation,
          activating,
          deactivating,
          entering,
          exiting,
          routes,
          setter
        }))
      ).catch(err => {
        store.updateError(err)

        // Navigation error may be thrown by a guard or lifecycle hook.
        // If so, mark the current navigation as cancelled, and use the error Navigation as next.
        if (err instanceof Navigation) {
          return {
            type: EventTypes.NAVIGATION_CANCELLED,
            navigation: evt.navigation,
            nextNavigation: err,
            done: true
          }
        } else if (err instanceof RouteError) {
          const caughtPath = findCatchAllPath(partialPath)
          if (caughtPath.length > 0) {
            return {
              type: EventTypes.NAVIGATION_ACTIVATING,
              navigation,
              partialPath: caughtPath,
              routes: store.getNextRoutes(caughtPath, navigation.to)
            }
          }
        }

        return {
          type: EventTypes.NAVIGATION_ERROR,
          navigation,
          error: err,
          done: true
        }
      })
    }
    case EventTypes.NAVIGATION_ACTIVATED: {
      const { navigation, routes, exiting, entering } = evt

      return Promise.resolve({
        type: EventTypes.NAVIGATION_TRANSITION_START,
        navigation: evt.navigation,
        routes,
        entering,
        exiting,
        setter: action(() => {
          store.updateRoutes(routes)
          store.updateLocation(navigation.to)
        })
      })
    }
    case EventTypes.NAVIGATION_TRANSITION_START: {
      const { navigation, routes, exiting, entering } = evt
      let done
      if (navigation.shouldTransition) {
        // Run and wait on transition of exiting and newly entering nodes.
        done = Promise.all([
          TransitionManager.run('exiting', exiting),
          TransitionManager.run('entering', entering)
        ])
      } else {
        done = Promise.resolve()
      }

      return done.then(() => ({
        type: EventTypes.NAVIGATION_TRANSITION_END,
        navigation,
        routes,
        entering,
        exiting
      }))
    }
    case EventTypes.NAVIGATION_TRANSITION_END: {
      const { exiting, entering } = evt

      exiting.forEach(route => typeof route.node.value.onExit === 'function' && route.node.value.onExit(route))
      entering.forEach(route => typeof route.node.value.onEnter === 'function' && route.node.value.onEnter(route))

      return Promise.resolve({
        type: EventTypes.NAVIGATION_END,
        navigation: evt.navigation,
        routes: entering,
        done: true
      })
    }
    case EventTypes.NAVIGATION_ERROR: {
      return Promise.resolve(null)
    }
    case EventTypes.NAVIGATION_CANCELLED: {
      return Promise.resolve({
        type: EventTypes.EMPTY,
        navigation: evt.navigation,
        setter: () => {
          store.cancel(evt.navigation)
          store.clearPrevRoutes()
        }
      })
    }
    case EventTypes.NAVIGATION_END: {
      const { routes } = evt
      const leaf = routes && routes[routes.length - 1]

      return Promise.resolve({
        type: EventTypes.EMPTY,
        navigation: evt.navigation,
        setter: () => {
          if (!isCatchAll(leaf && leaf.node)) {
            store.updateError(null)
          }

          store.clearPrevRoutes()
        }
      })
    }
    default:
      return Promise.resolve(evt)
  }
}

/*
 * Private helpers.
 */

function diffRoutes(currRoutes: Route<*, *>[], nextRoutes: Route<*, *>[]) {
  let parentWillResolve

  // Exiting this specific route instance
  const exiting = currRoutes.reduce((acc, x, idx) => {
    const y = nextRoutes.length > idx ? nextRoutes[idx] : undefined
    if (acc.length > 0 || !areRoutesEqual(x, y)) {
      acc.push(x)
    }
    return acc
  }, []).reverse()

  // Entering this specific route instance
  const entering = nextRoutes.reduce((acc, x, idx) => {
    const y = currRoutes.length > idx ? currRoutes[idx] : undefined
    if (acc.length > 0 || !areRoutesEqual(x, y)) {
      acc.push(x)
    }
    return acc
  }, [])

  // Deactivating this route state tree node
  parentWillResolve = false
  const deactivating = currRoutes.reduce((acc, x, idx) => {
    const y = nextRoutes.length > idx ? nextRoutes[idx] : undefined
    if (acc.length > 0 || parentWillResolve || x.node !== (y && y.node)) {
      acc.push(x)
    }
    if (!areRoutesEqual(x, y)) { parentWillResolve = true }
    return acc
  }, []).reverse()

  // Activating this route state tree node
  parentWillResolve = false
  const activating = nextRoutes.reduce((acc, x, idx) => {
    const y = currRoutes.length > idx ? currRoutes[idx] : undefined
    if (acc.length > 0 || parentWillResolve || x.node !== (y && y.node)) {
      acc.push(x)      
    }
    if (!areRoutesEqual(x, y)) { parentWillResolve = true }
    return acc
  }, [])

  return { activating, deactivating, entering, exiting }
}

type HookType =
  | 'canDeactivate'
  | 'canActivate'
  | 'willDeactivate'
  | 'willActivate'
  | 'willResolve'

type Operation = {
  type: HookType,
  includes?: Route<*, *>[]
}

function isIncluded(route: Route<*, *>, routes: ?Route<*, *>[]) {
  return routes ? routes.includes(route) : true
}

type EvalState = {
  caughtError: boolean,
  setters: Array<any>
}

function evalTransition(
  operation: Operation,
  route: Route<*, *>,
  navigation: Navigation,
  state: EvalState
): Promise<void | Function> {
  const { value } = route.node
  const { type, includes } = operation
  const result = typeof value[type] === 'function' && isIncluded(route, includes)
    ? value[type](route, navigation)
    : true
  
  // If the guard results in `false` or a rejected promise then mark transition as failed.
  if (undefined === result || false === result) {
    return navigation.goBack() // TODO: This `goBack` will not work if this is the first navigation in the system.
  } else if (typeof result.then === 'function') {
    return result.then(x => {
      if (typeof x === 'function') {
        state.setters.push(x)
      }
    })
    .catch(err => {
      if (typeof route.node.value.onError === 'function') {
        const result = route.node.value.onError(route, navigation, err)
        if (typeof result.then === 'function') {
          return result.then(() => {
            state.caughtError = true
          })
        }
      }
      return Promise.reject(err)
    })
  } else {
    return Promise.resolve()
  }
}

function evalTransitions(
  operations: Operation[],
  route: Route<*, *>,
  navigation: Navigation,
  state: EvalState
) {
  return operations
    .reduce((curr, operation) => {
      return state.caughtError
        ? Promise.resolve()
        : curr.then(() => evalTransition(operation, route, navigation, state))
    }, Promise.resolve())
}

function evalTransitionsForRoutes(
  operations: Operation[],
  routes: Route<*, *>[],
  navigation: Navigation
) {
  const state = {
    caughtError: false,
    setters: []
  }

  return routes
    .reduce((curr, route) => {
      return state.caughtError
        ? Promise.resolve()
        : curr.then(() => evalTransitions(operations, route, navigation, state))
    }, Promise.resolve())
    .then(() => () => state.setters.forEach(f => f()))
}

function isCatchAll(node) {
  return !!(node && node.value.path === '**')
}

function findCatchAllPath(path) {
  const leaf = path[path.length - 1]

  if (!leaf) {
    return []
  }

  let idx = path.length - 1
  let foundNode
  while (idx >= 0) {
    const element = path[idx]
    foundNode = element.node.children.find(isCatchAll)

    if (foundNode) {
      break
    }

    idx--
  }

  if (foundNode) {
    return path.slice(0, idx).concat([
      {
        node: foundNode,
        parentUrl: leaf.parentUrl,
        segment: leaf.remaining,
        remaining: '',
        params: {}
      }
    ])
  }

  return []
}
