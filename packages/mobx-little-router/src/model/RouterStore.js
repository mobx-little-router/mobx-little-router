// @flow
import type { IObservableArray } from 'mobx'
import { extendObservable, runInAction, computed, observable } from 'mobx'
import type { ObservableMap } from 'mobx'
import RouterStateTree from './RouterStateTree'
import type { Location, ActivatedRoute, RouteNode, RouteValue, Params } from './types'

type RouteValueChange = $Shape<RouteValue<*, *>>

type SerializedActivatedRoute = {
  key: string,
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
  cache: ObservableMap<RouteNode<*, *>>

  // Keep a list of activated nodes so we can track differences when transitioning to a new state.
  nodes: IObservableArray<ActivatedRoute<*,*>>
  prevNodes: IObservableArray<ActivatedRoute<*,*>>

  _activatedRoutes: IObservableArray<SerializedActivatedRoute>
  _prevActivatedRoutes: IObservableArray<SerializedActivatedRoute>

  constructor(root: RouteNode<*, *>, children: void | RouteNode<*, *>[]) {
    this.state = new RouterStateTree(root)

    extendObservable(this, {
      location: {},
      error: null,
      cache: observable.map({ [root.value.key]: root }),
      _activatedRoutes: observable.array([]),
      _prevActivatedRoutes: observable.array([]),
      nodes: computed(() => {
        return this._activatedRoutes.map(x => ({
          node: this.cache.get(x.key),
          ...x
        }))
      }),
      prevNodes : computed(() => {
        return this._prevActivatedRoutes.map(x => ({
          node: this.cache.get(x.key),
          ...x
        }))
      })
    })

    if (children) {
      this.replaceChildren(root, children)
    }
  }

  /* Queries */

  // Ensures we always get the matched copy from state.
  getNode(x: RouteNode<*, *>): RouteNode<*, *> {
    const existing = this.cache.get(x.value.key)
    if (existing) {
      return existing
    } else {
      throw new Error('Node not found in state tree.')
    }
  }

  /* Mutations */

  replaceChildren(parent: RouteNode<*, *>, nodes: RouteNode<*, *>[]) {
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

  updateNode(node: RouteNode<*, *>, updates: RouteValueChange) {
    const existing = this.getNode(node)
    runInAction(() => {
      Object.assign(existing.value, updates)
    })
  }

  updateActivatedRoutes(nodes: ActivatedRoute<*, *>[]) {
    runInAction(() => {
      this._prevActivatedRoutes.replace(this._activatedRoutes.slice())
      this._activatedRoutes.replace(nodes.map(x => ({
        params: x.params,
        context: x.context,
        data: x.data,
        key: x.key
      })))
      // nodes.forEach(x => {
      //   this.cache.set(x.value.key, x)
      // })
    })
  }
  
  commit(nextLocation: Location) {
    runInAction(() => {
      this.location = nextLocation
      this._prevActivatedRoutes.replace([])
    })
  }

  rollback() {
    runInAction(() => {
      this._prevActivatedRoutes.replace(this._prevActivatedRoutes.slice())
      this._prevActivatedRoutes.replace([])
    })
  }

  setError(err: null | Object) {
    runInAction(() => {
      this.error = err
    })
  }
}

export default RouterStore
