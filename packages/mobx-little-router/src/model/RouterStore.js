// @flow
import type { IObservableArray, ObservableMap } from 'mobx'
import { extendObservable, observable, runInAction } from 'mobx'
import createRouteStateTreeNode from './createRouteStateTreeNode'
import createRouteInstance from './createRouteInstance'
import RouterStateTree from './RouterStateTree'
import qs from 'querystring'
import areRoutesEqual from './util/areRoutesEqual'
import type Navigation from './Navigation'
import type { Config, Location, Params, PathElement, Query, Route, RouteStateTreeNode } from './types'

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

  activatedRoutes: IObservableArray<Route<*, *>>

  error: any

  cancelledSequence: number

  constructor(root: RouteStateTreeNode<*, *>) {
    extendObservable(
      this,
      {
        state: new RouterStateTree(root),
        cancelledSequence: -1,
        location: {},
        params: observable.map({}),
        cache: observable.map({ [root.value.key]: root }),
        activatedRoutes: observable.array([]),
        error: null
      },
      {
        state: observable.ref,
        cancelledSequence: observable.ref
      }
    )
  }

  getNextKey = (): string => {
    const key = this.nextKey
    runInAction(() => {
      this.nextKey++
    })
    return `${key}`
  }

  /* Queries */

  createNextRouteInstances(path: PathElement<*, *>[], nextLocation: Location): Route<*, *>[] {
    const query = getQueryParams(nextLocation)
    return path.map(element => {
      const matchedQueryParams = this.getMatchedQueryParams(element.node, query)
      const route = createRouteInstance(
        element.node,
        element.parentUrl,
        element.segment,
        element.params,
        matchedQueryParams
      )

      return this.activatedRoutes.find(areRoutesEqual(route)) || route
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
    const x = this.activatedRoutes.find(route => route.node.value.key === key)
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

  updateActivatedRoutes(nextRoutes: Route<*, *>[]) {
    runInAction(() => {
      // Commit changes to underlying node
      nextRoutes.forEach(route => {
        const { committed } = route.node.value
        Object.assign(committed.params, route.params)
        Object.assign(committed.query, route.query)
        committed.state = route.state
      })

      // Reset committed params and query on deactivated routes
      const deactivatingRoutes = this.activatedRoutes.filter(route =>
        !nextRoutes.some(nextRoute =>
          route.node === nextRoute.node
        )
      )

      deactivatingRoutes.forEach(route => {
        const { committed: { params, query } } = route.node.value
        Object.keys(params).forEach(key => params[key] = null)
        Object.keys(query).forEach(key => query[key] = '')
      })

      this.activatedRoutes.replace(nextRoutes)

      // XXX we now have router.select which can select this data
      // Update params 
      this.params.clear()
      this.activatedRoutes.forEach(route => {
        this.params.set(route.node.value.key, route.params)
      })
    })
  }

  updateLocation(nextLocation: Location) {
    runInAction(() => {
      this.location = nextLocation
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
    return Object.keys(query).filter(key => node.value.query.includes(key)).reduce((acc, key) => {
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
