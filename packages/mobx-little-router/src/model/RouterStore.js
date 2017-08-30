// @flow
import type { IObservableArray } from 'mobx'
import { toJS, extendObservable, runInAction, observable } from 'mobx'
import type { ObservableMap } from 'mobx'
import RouterStateTree from './RouterStateTree'
import type { Location, RouteNode, RouteValue } from './types'

type RouteValueChange = $Shape<RouteValue<*>>

class RouterStore {
  location: Location
  error: null | Object
  state: RouterStateTree

  // Create a map of all nodes in tree so we can perform faster lookup.
  // Instances should be exactly the same as in state tree.
  cache: ObservableMap<RouteNode<*>>

  // Keep a list of activated nodes so we can track differences when transitioning to a new state.
  nodes: IObservableArray<RouteNode<*>>
  prevNodes: IObservableArray<RouteNode<*>>

  constructor(root: RouteNode<*>, children: void | RouteNode<*>[]) {
    this.state = new RouterStateTree(root)

    extendObservable(this, {
      location: {},
      error: null,
      cache: observable.map({ [root.value.key]: root }),
      nodes: observable.array([]),
      prevNodes: observable.array([])
    })

    if (children) {
      this.replaceChildren(root, children)
    }
  }

  /* Queries */

  // Ensures we always get the matched copy from state.
  getNode(x: RouteNode<*>): RouteNode<*> {
    const existing = this.cache.get(x.value.key)
    if (existing) {
      return existing
    } else {
      throw new Error('Node not found in state tree.')
    }
  }

  /* Mutations */

  replaceChildren(parent: RouteNode<*>, nodes: RouteNode<*>[]) {
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

  updateNode(node: RouteNode<*>, updates: RouteValueChange) {
    const existing = this.getNode(node)
    runInAction(() => {
      Object.assign(existing.value, updates)
    })
  }

  updateNodes(nodes: RouteNode<*>[]) {
    runInAction(() => {
      this.prevNodes.replace(this.nodes.slice())
      this.nodes.replace(nodes)
      nodes.forEach(x => {
        this.cache.set(x.value.key, x)
      })
    })
  }
  
  commit(nextLocation: Location) {
    runInAction(() => {
      this.location = nextLocation
      this.prevNodes.replace([])
    })
  }

  rollback() {
    runInAction(() => {
      this.nodes.replace(this.prevNodes.slice())
      this.prevNodes.replace([])
    })
  }

  setError(err: null | Object) {
    runInAction(() => {
      this.error = err
    })
  }

  handleRootError(err: Object) {
    runInAction(() => {
      this.error = err
    })
    return Promise.reject(err)
  }
}

export default RouterStore
