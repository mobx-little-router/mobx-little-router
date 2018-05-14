// @flow
import type { IObservableArray } from 'mobx'
import { extendObservable, runInAction, observable, computed } from 'mobx'
import createRouteStateTreeNode from './createRouteStateTreeNode'
import type { ObservableMap } from 'mobx'
import createRoute from './createRoute'
import RouterStateTree from './RouterStateTree'
import qs from 'querystring'
import areRoutesEqual from './util/areRoutesEqual'
import type Navigation from './Navigation'
import type {
  Location,
  Query,
  Params,
  Route,
  RouteStateTreeNode,
  PathElement,
  Config,
} from './types'

type TreeNodeMetaData<C, D> = {
  node: RouteStateTreeNode<C, D>,
  parent: null | RouteStateTreeNode<C, D>
}

class RouterStore {
  location: Location
  params: ObservableMap<Params>
  state: RouterStateTree
  nextKey = 0

  // Create a map of all nodes in tree so we can perform faster lookup.
  // Instances should be exactly the same as in state tree.
  cache: ObservableMap<TreeNodeMetaData<*, *>>
  // Keep a list of activated nodes so we can track differences when transitioning to a new state.
  routes: IObservableArray<Route<*, *>>
  prevRoutes: IObservableArray<Route<*, *>>

  error: any

  cancelledSequence: number

  constructor(root: RouteStateTreeNode<*, *>) {
    extendObservable(this, {
      state: new RouterStateTree(root),
      cancelledSequence: -1,
      location: {},
      params: observable.map({}),
      cache: observable.map({ [root.value.key]: root }),
      routes: observable.array([]),
      prevRoutes: observable.array([]),
      error: null
    }, {
      state: observable.ref,
      cancelledSequence: observable.ref
    })
  }

  getNextKey = (): string => {
    const key = this.nextKey
    runInAction(() => {
      this.nextKey++
    })
    return `${key}`
  }

  /* Queries */

  // Returns a list of the next routes from the matched path.
  // If the route is not currently active or has changed, then it will be created from factory function.
  getNextRoutes(path: PathElement<*, *>[], location: Location): Route<*, *>[] {
    const query = getQueryParams(location)
    return path.map(element => {
      const matchedQueryParams = this.getMatchedQueryParams(element.node, query)
      const newRoute = createRoute(element.node, element.parentUrl, element.segment, element.params, query)
      const existingRoute = this.routes.find(x => areRoutesEqual(x, newRoute))
      
      if (existingRoute) {
        return existingRoute
      } else {
        return observable(createRoute(element.node, element.parentUrl, element.segment, element.params, matchedQueryParams))
      }
    })
  }

  getNode(key: string): null | RouteStateTreeNode<*, *> {
    const x = this.cache.get(key)
    if (x) {
      const { node } = x
      return node
    } else {
      return null
    }
  }

  getNodeUnsafe(key: string): RouteStateTreeNode<*, *> {
    const x = this.getNode(key)
    if (!x) {
      throw new Error(`Cannot find node with key ${key}`)
    } else {
      return x
    }
  }

  getRoute(key: string): null | Route<*, *> {
    const x = this.routes.find(route => route.node.value.key === key)
    if (x) {
      return x
    } else {
      return null
    }
  }

  getRouteUnsafe(key: string): Route<*, *> {
    const x = this.getRoute(key)
    if (x) {
      return x
    } else {
      throw new Error(`Cannot find route with key ${key}`)
    }
  }

  getParams(key: string): null | Params {
    const params = this.params.get(key)
    if (params) {
      return params
    } else {
      return null
    }
  }

  /* Mutations */

  replaceChildren(node: RouteStateTreeNode<*, *>, children: Config<*>[]): void {
    node.children.replace(children.map(x => this._createNode(node, x)))
  }

  updateError(err: any) {
    runInAction(() => {
      this.error = err
    })
  }

  updateRoutes(routes: Route<*, *>[]) {
    runInAction(() => {
      this.prevRoutes.replace(this.routes.slice())
      this.routes.replace(routes)

      // Update params
      this.params.clear()
      this.routes.forEach(route => {
        this.params.set(route.node.value.key, route.params)
      })
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

  cancel(navigation: null | Navigation) {
    if (navigation) {
      this.cancelledSequence = navigation.sequence
    }
  }

  isCancelled(navigation: null | Navigation) {
    return navigation ? navigation.sequence <= this.cancelledSequence : false
  }

  getMatchedQueryParams(node: RouteStateTreeNode<*, *>, query: Query): Query {
    return Object.keys(query)
      .filter(key => node.value.query.includes(key))
      .reduce((acc, key) => {
        acc[key] = query[key]
        return acc
      }, {})
  }

  /* Private helpers */

  _createNode(parent: RouteStateTreeNode<*, *>, config: Config<*>) {
    const node = createRouteStateTreeNode(config, parent.value.getContext, this.getNextKey)
    this._storeInCache(parent, node)
    return node
  }

  _storeInCache(parent: RouteStateTreeNode<*, *>, node: RouteStateTreeNode<*, *>) {
    this.cache.set(node.value.key, { node: node, parent })
    node.children.forEach(child => this._storeInCache(node, child))
  }
}

function getQueryParams(location: Location): Query {
  return location.search != null ? qs.parse(location.search.substr(1)) : {}
}

export default RouterStore
