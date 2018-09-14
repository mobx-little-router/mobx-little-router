// @flow
import type { IObservable, IObservableArray, ObservableMap } from 'mobx'
import { computed, extendObservable, observable, runInAction } from 'mobx'
import createRouteStateTreeNode from './creating/createRouteStateTreeNode'
import RouterStateTree from './RouterStateTree'
import getNodeValue from './util/getNodeValue'
import type Navigation from './Navigation'
import type {
  Config,
  Location,
  Route,
  RoutesChangeSet,
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

const OBSERVABLE_ROUTE_PROPERTIES = ['params', 'query', 'model']

class RouterStore {
  location: Location
  state: RouterStateTree
  nextKey: number

  // Create a map of all nodes in tree so we can perform faster lookup.
  // Instances should be exactly the same as in state tree.
  cache: ObservableMap<TreeNodeMetaData<*, *>>

  activatedRoutes: IObservableArray<Route<*, *>>

  incomingRoutes: IObservableArray<Route<*, *>>

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
        incomingRoutes: observable.array(),
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

  /* Queries */

  getNode(key: string): null | RouteStateTreeNode<*, *> {
    const x = this.cache.get(key)
    return (x && x.node) || null
  }

  getNodeUnsafe(key: string): RouteStateTreeNode<*, *> {
    const node = this.getNode(key)
    if (node) return node
    else throw new Error(`Cannot find node for key ${key}`)
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

  isCancelled(navigation: null | Navigation) {
    return navigation ? navigation.sequence <= this.cancelledSequence : false
  }

  /* Mutations */

  updateChildren(node: RouteStateTreeNode<*, *>, children: Config<*>[]): void {
    runInAction(() => {
      node.children.replace(children.map(x => this._createNode(node, x)))
    })
  }

  updateError(err: any) {
    runInAction(() => {
      this.error = err
    })
  }

  updateIncomingRoutes(routes: Route<*, *>[]) {
    runInAction(() => {
      this.incomingRoutes.replace(routes)
    })
  }

  updateActivatedRoutes(changeset: RoutesChangeSet) {
    const { incomingRoutes: routes } = changeset
    runInAction(() => {
      // TODO: Should only dispose of routes that will be deactivated.
      this.activatedRoutes.forEach(route => route.dispose())

      this.activatedRoutes.replace(
        routes.map(r => {
          const existing = this.activatedRoutes.find(
            x => getNodeValue('key', x) === getNodeValue('key', r)
          )
          if (existing) {
            Object.assign(existing['query'], r['query'])
            Object.assign(existing['params'], r['params'])
            return existing
          } else {
            return r
          }
        })
      )

      // Resume subscriptions
      this.activatedRoutes.forEach(route => route.activate())
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

  /* Private helpers */

  _getNextKey = (): string => {
    const key = this.nextKey
    runInAction(() => {
      this.nextKey++
    })
    return `${key}`
  }

  _createNode(parent: RouteStateTreeNode<*, *>, config: Config<*>) {
    const node = createRouteStateTreeNode(config, parent.value.getContext, this._getNextKey)
    this._storeInCache(parent, node)
    return node
  }

  _storeInCache(parent: RouteStateTreeNode<*, *>, node: RouteStateTreeNode<*, *>) {
    this.cache.set(node.value.key, { node, parent })
    node.children.forEach(child => this._storeInCache(node, child))
  }
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
