// @flow
import type { IObservableArray } from 'mobx'
import { extendObservable, runInAction, observable } from 'mobx'
import type { ObservableMap } from 'mobx'
import RouterStateTree from './RouterStateTree'
import type { Location, RouteNode, RouteValue } from '../routing/types'
import createRouteNode from './createRouteNode'

type RouteValueChange = $Shape<RouteValue>

class RouterStore {
  location: Location
  error: null | Object
  state: RouterStateTree

  // Create a map of all nodes in tree so we can perform faster lookup.
  // Instances should be exactly the same as in state tree.
  cache: ObservableMap<RouteNode>

  // Keep a list of activated nodes so we can track differences when
  // transitioning to a new state.
  activeNodes: IObservableArray<RouteNode>

  constructor(children: void | RouteNode[]) {
    const root = createRouteNode({ path: '', onError: [this.handleRootError] }) // Initial root.
    this.state = new RouterStateTree(root)

    extendObservable(this, {
      location: {},
      error: null,
      cache: observable.map({ [root.value.key]: root }),
      activeNodes: observable.array([])
    })

    if (children) {
      this.replaceChildren(root, children)
    }
  }

  /* Queries */

  // Ensures we always get the matched copy from state.
  getNode(x: RouteNode): RouteNode {
    const existing = this.cache.get(x.value.key)
    if (existing) {
      return existing
    } else {
      throw new Error('Node not found in state tree.')
    }
  }

  /* Mutations */

  replaceChildren(parent: RouteNode, nodes: RouteNode[]) {
    const existing = this.getNode(parent)
    runInAction(() => {
      existing.children.replace(nodes)
      nodes.forEach(child => {
        this.cache.set(child.value.key, child)
        this.replaceChildren(child, child.children.slice())
      })
    })
  }

  updateNode(node: RouteNode, updates: RouteValueChange) {
    const existing = this.getNode(node)
    runInAction(() => {
      Object.assign(existing.value, updates)
    })
  }

  activateNodes(nodes: RouteNode[]) {
    runInAction(() => {
      this.activeNodes.replace(nodes)
    })
  }

  setLocation(next: Location) {
    runInAction(() => {
      this.location = next
    })
  }

  setActiveNodes(nodes: RouteNode[]) {
    runInAction(() => {
      this.activeNodes.replace(nodes)
    })
  }

  setError(err: Object) {
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
