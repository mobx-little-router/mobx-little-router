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

type RouteStateTreeNodeWithStringify<C, D> = RouteStateTreeNode<C, D> & {
  stringify: (x: Params) => string
}

class RouterStore {
  location: Location
  state: RouterStateTree
  nextKey = 0

  // Create a map of all nodes in tree so we can perform faster lookup.
  // Instances should be exactly the same as in state tree.
  cache: ObservableMap<TreeNodeMetaData<*, *>>
  // Keep a list of activated nodes so we can track differences when transitioning to a new state.
  routes: IObservableArray<Route<*, *>>
  prevRoutes: IObservableArray<Route<*, *>>
  cancelledSequence: number

  constructor(root: RouteStateTreeNode<*, *>) {
    this.state = new RouterStateTree(root)
    this.cancelledSequence = -1
    extendObservable(this, {
      location: {},
      cache: observable.map({ [root.value.key]: root }),
      routes: observable.array([]),
      prevRoutes: observable.array([])
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

  // All nodes should be created using this method.
  createNode(parent: RouteStateTreeNode<*, *>, config: Config<*>) {
    const node = createRouteStateTreeNode(config, parent.value.getContext, this.getNextKey)
    this.storeInCache(parent, node)
    return node
  }

  storeInCache(parent: RouteStateTreeNode<*, *>, node: RouteStateTreeNode<*, *>) {
    this.cache.set(node.value.key, { node: node, parent })
    node.children.forEach(child => this.storeInCache(node, child))
  }

  getNode(key: string): null | RouteStateTreeNodeWithStringify<*, *> {
    const x = this.cache.get(key)
    if (x) {
      const { node, parent } = x
      return {
        ...node,
        stringify: (x: Params) => {
          const paths = []
          let curr = node
          let prev = parent
          while (curr !== null) {
            paths.unshift(curr.value.matcher.stringify(x))
            const y = prev ? this.cache.get(prev.value.key) : null
            curr = prev
            prev = y ? (y.parent || null) : null
          }
          return paths.join('')
        }
      }
    } else {
      return null
    }
  }

  /* Mutations */

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
}

function getQueryParams(location: Location): Query {
  return location.search != null ? qs.parse(location.search.substr(1)) : {}
}

export default RouterStore
