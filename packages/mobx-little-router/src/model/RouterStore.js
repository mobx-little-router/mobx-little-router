// @flow
import type { IObservableArray } from 'mobx'
import { extendObservable, runInAction, computed, observable } from 'mobx'
import type { ObservableMap } from 'mobx'
import RouterStateTree from './RouterStateTree'
import type { Location, Route, RouteStateTreeNode, RouteValue, Params } from './types'

type RouteValueChange = $Shape<RouteValue<*, *>>

type SerializedRoute = {
  key: string,
  nodeKey: string,
  params: Params,
  context: any,
  data: any
}

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

  _serializedRoutes: IObservableArray<SerializedRoute>
  _serializedPrevRouts: IObservableArray<SerializedRoute>

  constructor(root: RouteStateTreeNode<*, *>, children: void | RouteStateTreeNode<*, *>[]) {
    this.state = new RouterStateTree(root)

    extendObservable(this, {
      location: {},
      error: null,
      cache: observable.map({ [root.value.key]: root }),
      _serializedRoutes: observable.array([]),
      _serializedPrevRouts: observable.array([]),
      routes: computed(() => this.toRoutes(this._serializedRoutes)),
      prevRoutes: computed(() => this.toRoutes(this._serializedPrevRouts))
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
      this._serializedPrevRouts.replace(this._serializedRoutes.slice())
      this._serializedRoutes.replace(
        routes.map(x => ({
          params: x.params,
          nodeKey: x.node.value.key,
          context: x.context,
          segment: x.segment,
          data: x.data,
          key: x.key
        }))
      )
    })
  }

  commit(nextLocation: Location) {
    runInAction(() => {
      this.location = nextLocation
      this._serializedPrevRouts.replace([])
    })
  }

  rollback() {
    runInAction(() => {
      this._serializedPrevRouts.replace(this._serializedPrevRouts.slice())
      this._serializedPrevRouts.replace([])
    })
  }

  setError(err: null | Object) {
    runInAction(() => {
      this.error = err
    })
  }

  toRoutes(serialized: IObservableArray<SerializedRoute>) {
      return serialized.map(x => {
        const node = this.cache.get(x.nodeKey)
        return {
          node,
          onTransition: node.value.onTransition,
          ...x
        }
      })
    }
}

export default RouterStore
