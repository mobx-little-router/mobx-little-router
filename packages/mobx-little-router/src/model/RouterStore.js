// @flow
import type { IObservableArray, ObservableMap } from 'mobx'
import { computed, extendObservable, observable, runInAction } from 'mobx'
import createRouteStateTreeNode from './creating/createRouteStateTreeNode'
import createRouteInstance from './creating/createRouteInstance'
import RouterStateTree from './RouterStateTree'
import qs from 'querystring'
import areRoutesEqual from './util/areRoutesEqual'
import type Navigation from './Navigation'
import type {
  Config,
  Location,
  PathElement,
  Query,
  Route,
  RouteStateTreeNode,
  SelectBody
} from './types'

type TreeNodeMetaData<C, D> = {
  node: RouteStateTreeNode<C, D>,
  parent: null | RouteStateTreeNode<C, D>
}

type InitialState = {
  activatedRoutes: Object[],
  store: Object
}

const OBSERVABLE_ROUTE_PROPERTIES = ['params', 'query', 'computed']

class RouterStore {
  location: Location
  state: RouterStateTree
  nextKey: number

  // Create a map of all nodes in tree so we can perform faster lookup.
  // Instances should be exactly the same as in state tree.
  cache: ObservableMap<TreeNodeMetaData<*, *>>

  activatedRoutes: IObservableArray<Route<*, *>>

  initialActivatedRoutes: Object

  error: any

  cancelledSequence: number

  constructor(root: RouteStateTreeNode<*, *>, initialState?: InitialState) {
    extendObservable(
      this,
      {
        state: new RouterStateTree(root),
        cancelledSequence: -1,
        location: initialState ? initialState.store.location : {},
        cache: observable.map({ [root.value.key]: root }),
        activatedRoutes: observable.array(),
        error: null,
        initialActivatedRoutes: initialState ? initialState.activatedRoutes : {},
        nextKey: initialState ? initialState.store.nextKey : 0
      },
      {
        nextKey: observable.ref,
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

  createNextRouteInstances(path: PathElement<*, *>[], nextLocation: Location): Route<*, *>[] {
    const query = getQueryParams(nextLocation)
    const ancestors = []

    return path.map(element => {
      const { node, parentUrl, segment, params } = element
      const matchedQueryParams = this.getMatchedQueryParams(node, query)
      const initialRoute = this.initialActivatedRoutes[node.value.key]
      const initialState = initialRoute ? initialRoute.state : undefined
      const newRoute = createRouteInstance(
        node,
        parentUrl,
        segment,
        params,
        matchedQueryParams,
        ancestors,
        initialState
      )

      const route = this.activatedRoutes.find(areRoutesEqual(newRoute)) || newRoute

      ancestors.push(route)

      return route
    })
  }

  /* Queries */

  getNode(key: string): null | RouteStateTreeNode<*, *> {
    const x = this.cache.get(key)
    return (x && x.node) || null
  }

  select<T: SelectBody>(spec: string | T): IObservable<T> {
    if (!spec) {
      throw new Error(`A query object must be passed to select function.`)
    }

    if (typeof spec === 'string') {
      const parts = spec.split('.')
      const obj = selectObservableObject(createBody(parts), this.activatedRoutes)
      return computed(() => parts.reduce((acc, k) => acc[k], obj))
    } else {
      return observable(selectObservableObject(spec, this.activatedRoutes))
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
      this.activatedRoutes.replace(nextRoutes)
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
    return node.value.query.reduce((acc, key) => {
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
    this.cache.set(node.value.key, { node, parent })
    node.children.forEach(child => this._storeInCache(node, child))
  }
}

function getQueryParams(location: Location): Query {
  return location.search != null ? qs.parse(location.search.substr(1)) : {}
}

function createBody(path: string[]): SelectBody {
  const body = {}
  let head = body

  path.forEach((k, idx) => {
    head[k] = idx === path.length - 1 ? null : {}
    head = head[k]
  })

  return body
}

function selectObservableObject(body, activatedRoutes) {
  const obj = {}

  // Prevents computeds from updating if not all routes have matched.
  const guard$ = computed(() => {
    return Object.keys(body).every(routeKey =>
      activatedRoutes.find(route => route.node.value.key === routeKey)
    )
  })

  Object.keys(body).forEach(routeKey => {
    obj[routeKey] = {}
    OBSERVABLE_ROUTE_PROPERTIES.forEach(type => {
      const { [type]: defaults } = body[routeKey]
      if (defaults) {
        obj[routeKey][type] = {}
        Object.keys(defaults).forEach(key => {
          const route$ = createRouteObs(activatedRoutes, routeKey)
          const value$ = createValueObs({ route$, key, type, defaults })

          defineComputedProperty({
            object: obj[routeKey][type],
            key,
            value$,
            guard$
          })
        })
      }
    })
  })
  return obj
}

function createRouteObs(routes, key) {
  return computed(() => routes.find(route => route.node.value.key === key) || null)
}

function createValueObs({ route$, type, defaults, key }) {
  return computed(() => {
    const currRoute = route$.get()
    if (currRoute) {
      return currRoute[type][key] || defaults[key]
    } else {
      return defaults[key]
    }
  })
}

function defineComputedProperty({ object, guard$, value$, key }) {
  let _state = value$.get()
  Object.defineProperty(object, key, {
    enumerable: true,
    get() {
      if (guard$.get()) {
        _state = value$.get()
      }
      return _state
    }
  })
}

export default RouterStore
