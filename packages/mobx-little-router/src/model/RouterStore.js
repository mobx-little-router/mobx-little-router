// @flow
import type { IObservableArray } from 'mobx'
import { extendObservable, runInAction, observable, computed } from 'mobx'
import type { ObservableMap } from 'mobx'
import createRoute from './createRoute'
import createRouteKey from './createRouteKey'
import RouterStateTree from './RouterStateTree'
import * as QueryString from 'qs'

import type {
  Location,
  Query,
  Route,
  RouteStateTreeNode,
  PathElement,
  RouteValue
} from './types'

type RouteValueChange = $Shape<RouteValue<*, *>>

class RouterStore {
  location: Location
  error: null | Object
  state: RouterStateTree

  // Create a map of all nodes in tree so we can perform faster lookup.
  // Instances should be exactly the same as in state tree.
  cache: ObservableMap<RouteStateTreeNode<*, *>>
  // Keep a list of activated nodes so we can track differences when transitioning to a new state.
  routes: IObservableArray<Route<*, *>>
  prevRoutes: IObservableArray<Route<*, *>>
  query: Query

  constructor(
    root: RouteStateTreeNode<*, *>,
    children: void | RouteStateTreeNode<*, *>[]
  ) {
    this.state = new RouterStateTree(root)

    extendObservable(this, {
      location: {},
      query: computed(() => this.getQueryParams(this.location)),
      error: null,
      cache: observable.map({ [root.value.key]: root }),
      routes: observable.array([]),
      prevRoutes: observable.array([])
    })

    if (children) {
      this.replaceChildren(root, children)
    }
  }

  /* Queries */

  // Ensures we always get the matched copy from state.
  getNode(x: RouteStateTreeNode<*, *>): RouteStateTreeNode<*, *> {
    const existing = this.cache.get(x.value.key)
    if (existing) {
      return existing
    } else {
      throw new Error('Node not found in state tree.')
    }
  }

  // Returns a list of the next routes from the matched path.
  // If the route is not currently active or has changed, then it will be created from factory function.
  getNextRoutes(path: PathElement<*, *>[], location: Location): Route<*, *>[] {
    const queryParams = this.getQueryParams(location)
    
    return path.map(element => {
      const matchedQueryParams = this.getMatchedQueryParams(element.node, queryParams)

      const existingRoute = this.routes.find(
        x => x.key === createRouteKey(element.node, element.segment, matchedQueryParams)
      )

      return existingRoute || observable(createRoute(element.node, element.segment, element.params, matchedQueryParams))
    })
  }

  /* Mutations */

  replaceChildren(parent: RouteStateTreeNode<*, *>, nodes: RouteStateTreeNode<*, *>[]) {
    const existing = this.getNode(parent)
    nodes.forEach(x => {
      runInAction(() => {
        x.value.getContext = parent.value.getContext
      })
    })
    runInAction(() => {
      existing.children.replace(nodes)
      nodes.forEach(child => {
        this.cache.set(child.value.key, child)
        this.replaceChildren(child, child.children.slice())
      })
    })
  }

  updateNode(node: RouteStateTreeNode<*, *>, updates: RouteValueChange) {
    const existing = this.getNode(node)
    runInAction(() => {
      Object.assign(existing.value, updates)
    })
  }

  updateRoutes(routes: Route<*, *>[]) {
    runInAction(() => {
      this.prevRoutes.replace(this.routes.slice())
      this.routes.replace(routes)
    })
  }

  updateLocation(nextLocation: Location) {
    runInAction(() => {
      this.location = nextLocation
    })
  }

  clearPrevRoutes() {
    runInAction(() => {
      this.prevRoutes.replace([])
    })
  }

  setError(err: null | Object) {
    runInAction(() => {
      this.error = err
    })
  }

  getQueryParams(location: Location): Query {
    return location.search != null
      ? QueryString.parse(location.search.substr(1))
      : {}
  }

  getMatchedQueryParams(node: RouteStateTreeNode<*, *>, query: Query): Query {
    return Object.keys(query)
      .filter(key => node.value.query.includes(key))
      .reduce((acc, key) => {
        acc[key] = query[key]
        return acc
      }, {})
  }
}

export default RouterStore
