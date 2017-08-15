// @flow
import type { IObservableArray } from 'mobx'
import { action, observable } from 'mobx'
import type {ObservableMap} from 'mobx'
import RouterStateTree from './RouterStateTree'
import type { RouteNode, RouteValue } from '../routing/types'
import createRouteNode from './createRouteNode'
import type { Location } from '../history/types'

type RouteValueChange = $Shape<RouteValue>

class RouterStore {
  @observable location: null | Location
  @observable error: null | Object
  @observable state: RouterStateTree

  // Create a map of all nodes in tree so we can perform faster lookup.
  // Instances should be exactly the same as in state tree.
  @observable cache: ObservableMap<RouteNode>

  // Keep a list of activated nodes so we can track differences when
  // transitioning to a new state.
  @observable activeNodes: IObservableArray<RouteNode>

  constructor(children: void | RouteNode[]) {
    const root = createRouteNode({ path: '', onError: [this.handleRootError] }) // Initial root.
    this.location = null
    this.error = null
    this.cache = observable.map({ [root.value.key]: root })
    this.activeNodes = observable.array()
    this.state = new RouterStateTree(root)

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

  @action
  replaceChildren(parent: RouteNode, nodes: RouteNode[]) {
    const existing = this.getNode(parent)
    existing.children.replace(nodes)
    nodes.forEach(child => {
      this.cache.set(child.value.key, child)
      this.replaceChildren(child, child.children.slice())
    })
  }

  @action
  updateNode(node: RouteNode, updates: RouteValueChange) {
    const existing = this.getNode(node)
    Object.assign(existing.value, updates)
  }

  @action
  activateNodes(nodes: RouteNode[]) {
    this.activeNodes.replace(nodes)
  }

  @action
  setLocation(next: Location) {
    this.location = next
  }

  @action
  setError(err: Object) {
    this.error = err
  }

  @action
  handleRootError(err: Object) {
    this.error = err
    return Promise.reject(err)
  }
}

export default RouterStore
