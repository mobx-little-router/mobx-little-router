// @flow
import { action, observable, runInAction, set } from 'mobx'
import type RouterStore from '../model/RouterStore'
import { NotFound } from '../errors'
import Navigation from '../model/Navigation'
import type { Route } from '../model/types'
import isUrlFullyMatched from './util/isUrlFullyMatched'
import areRoutesEqual from '../model/util/areRoutesEqual'
import getNodeValue from '../model/util/getNodeValue'
import setNodeValue from '../model/util/setNodeValue'
import TransitionManager from '../transition/TransitionManager'
import type { Event } from '../events'
import { EventTypes } from '../events'
import { RouteError } from '../errors'

/*
 * This function maps an Event to a new Event. It is used by the Scheduler to manage data flow.
 */

export default function maybeProcessEvent(evt: Event, store: RouterStore): Promise<Event> {
  return Promise.resolve({ evt, store })
    .then(processEvent)
    .then(next => {
      if (!next) {
        return { type: EventTypes.EMPTY, navigation: null }
      }

      if (store.isCancelled(next.navigation)) {
        return { type: EventTypes.EMPTY, navigation: null }
      } else {
        // Any setters returned after willResolve is called here.
        if (next.setter) {
          next.setter()
        }
        return next
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
}

export function processEvent({ evt, store }: { evt: Event, store: RouterStore }): Promise<null | Event> {
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
      const loader = getNodeValue('loadChildren', leaf)

      if (typeof loader === 'function') {
        return Promise.resolve({
          type: EventTypes.CHILDREN_CONFIG_REQUESTED,
          navigation: evt.navigation,
          partialPath: matchedPath,
          leaf,
          loader
        })
      }

      if (!isFullyMatched) {
        return Promise.resolve({
          type: EventTypes.NAVIGATION_NOT_MATCHED,
          navigation: evt.navigation,
          matchedPath: matchedPath
        })
      }

      if (isCatchAll(leaf && leaf.node)) {
        store.updateError(new NotFound(navigation))
      }

      return Promise.resolve({
        type: EventTypes.NAVIGATION_ACTIVATING,
        navigation: evt.navigation,
        matchedPath
      })
    }
    case EventTypes.NAVIGATION_NOT_MATCHED: {
      const { matchedPath, navigation } = evt
      const caughtPath = findCatchAllPath(matchedPath)
      if (caughtPath.length > 0) {
        return Promise.resolve({
          type: EventTypes.NAVIGATION_ACTIVATING,
          navigation: evt.navigation,
          matchedPath: caughtPath
        })
      } else {
        return Promise.resolve({
          type: EventTypes.NAVIGATION_ERROR,
          navigation,
          error: new NotFound(navigation),
          done: true
        })
      }
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
          setNodeValue('loadChildren', null, leaf)
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
      const { navigation, matchedPath } = evt
      const currRoutes = store.activatedRoutes.slice()
      const nextRoutes = store.createNextRouteInstances(matchedPath, navigation.to)
      const { activating, deactivating, entering, exiting } = diffRoutes(currRoutes, nextRoutes)

      // Add matched leaf to the navigation object so it can be used for redirection
      navigation.leaf = nextRoutes[nextRoutes.length - 1]

      return Promise.resolve()
        .then(() =>
          evalTransitionsForRoutes([{ type: 'canDeactivate' }, { type: 'willDeactivate' }], deactivating, navigation)
        )
        .then(() => {
          runInAction(() => {
            // Dispose of all route disposers when deactivating a route
            deactivating.forEach(route => {
              const { disposers, current: { params, query } } = route.node.value

              disposers.forEach(disposer => disposer())
              disposers.length = 0

              Object.keys(params).forEach(key => params[key] = null)
              Object.keys(query).forEach(key => query[key] = '')
            })

            // Start all subscriptions when activating a route
            activating.forEach(route => {
              const { subscriptions, current } = route.node.value

              Object.keys(route.params).forEach(key => {
                set(current.params, key, null)
              })

              Object.keys(route.query).forEach(key => {
                set(current.query, key, '')
              })

              if (typeof subscriptions === 'function') {
                route.node.value.disposers = [].concat(subscriptions(current))
              }
            })

            // Commit changes to underlying node
            nextRoutes.forEach(route => {
              const { current } = route.node.value

              Object.assign(current.params, route.params)
              Object.assign(current.query, route.query)
              current.state = route.state
            })
          })

          return evalTransitionsForRoutes(
            [
              { type: 'canActivate', includes: activating },
              { type: 'willActivate', includes: activating },
              { type: 'willResolve', includes: entering }
            ],
            nextRoutes,
            navigation
          )
        })
        .then((setter: Function) => ({
          type: EventTypes.NAVIGATION_ACTIVATED,
          navigation,
          activating,
          deactivating,
          entering,
          exiting,
          nextRoutes,
          setter
        }))
        .catch(err => {
          if (err instanceof Navigation) {
            return {
              type: EventTypes.NAVIGATION_CANCELLED,
              navigation: evt.navigation,
              nextNavigation: err,
              done: true
            }
          } else if (err instanceof RouteError) {
            return {
              type: EventTypes.NAVIGATION_NOT_MATCHED,
              navigation: evt.navigation,
              matchedPath: evt.matchedPath
            }
          } else {
            return {
              type: EventTypes.NAVIGATION_ERROR,
              navigation: evt.navigation,
              error: err,
              done: true
            }
          }
        })
    }
    case EventTypes.NAVIGATION_ACTIVATED: {
      const { navigation, nextRoutes, exiting, entering } = evt

      return Promise.resolve({
        type: EventTypes.NAVIGATION_TRANSITION_START,
        navigation: evt.navigation,
        setter: action(() => {
          store.updateActivatedRoutes(nextRoutes)
          store.updateLocation(navigation.to)
        }),
        entering,
        exiting
      })
    }
    case EventTypes.NAVIGATION_TRANSITION_START: {
      const { navigation, exiting, entering } = evt
      let done
      if (navigation.shouldTransition) {
        // Run and wait on transition of exiting and newly entering nodes.
        done = Promise.all([TransitionManager.run('exiting', exiting), TransitionManager.run('entering', entering)])
      } else {
        done = Promise.resolve()
      }

      return done.then(() => ({
        type: EventTypes.NAVIGATION_TRANSITION_END,
        navigation,
        entering,
        exiting
      }))
    }
    case EventTypes.NAVIGATION_TRANSITION_END: {
      const { exiting, entering } = evt

      exiting.forEach(invokeTransitionFunction('onExit'))
      entering.forEach(invokeTransitionFunction('onEnter'))

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
          if (!isCatchAll(leaf)) {
            store.updateError(null)
          }
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

function normalizePath(x: string) {
  return x.endsWith('/') ? x : `${x}/`
}

function diffRoutes(currRoutes: Route<*, *>[], nextRoutes: Route<*, *>[]) {
  let parentWillResolve

  // Exiting this specific route instance
  const exiting = currRoutes
    .reduce((acc, x, idx) => {
      const y = nextRoutes.length > idx ? nextRoutes[idx] : undefined
      if (acc.length > 0 || !areRoutesEqual(x, y)) {
        acc.push(x)
      }
      return acc
    }, [])
    .reverse()

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
  const deactivating = currRoutes
    .reduce((acc, x, idx) => {
      const y = nextRoutes.length > idx ? nextRoutes[idx] : undefined
      if (acc.length > 0 || parentWillResolve || x.node !== (y && y.node)) {
        acc.push(x)
      }
      if (!areRoutesEqual(x, y)) {
        parentWillResolve = true
      }
      return acc
    }, [])
    .reverse()

  // Activating this route state tree node
  parentWillResolve = false
  const activating = nextRoutes.reduce((acc, x, idx) => {
    const y = currRoutes.length > idx ? currRoutes[idx] : undefined
    if (acc.length > 0 || parentWillResolve || x.node !== (y && y.node)) {
      acc.push(x)
    }
    if (!areRoutesEqual(x, y)) {
      parentWillResolve = true
    }
    return acc
  }, [])

  return { activating, deactivating, entering, exiting }
}

type HookType = 'canDeactivate' | 'canActivate' | 'willDeactivate' | 'willActivate' | 'willResolve'

type Operation = {
  type: HookType,
  includes?: Route<*, *>[]
}

function isIncluded(route: Route<*, *>, routes: ?(Route<*, *>[])) {
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
    return result
      .then(x => {
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

function evalTransitions(operations: Operation[], route: Route<*, *>, navigation: Navigation, state: EvalState) {
  return operations.reduce((curr, operation) => {
    return state.caughtError ? Promise.resolve() : curr.then(() => evalTransition(operation, route, navigation, state))
  }, Promise.resolve())
}

function evalTransitionsForRoutes(operations: Operation[], routes: Route<*, *>[], navigation: Navigation) {
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

function invokeTransitionFunction(type) {
  return route => getTransitionFunction(type)(route).call(route)
}

function getTransitionFunction(type) {
  return route => getNodeValue(type, route) || (route => {})
}
