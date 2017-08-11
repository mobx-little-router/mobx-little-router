// @flow
import { action, observable, ObservableMap } from 'mobx'
import type { IObservableArray } from 'mobx'
import RouterStateTree from './RouterStateTree'
import type { RouteNode } from './RouterStateTree'
import createRouteNode from './createRouteNode'
import type { Location } from './types'

class RouterStore {
  @observable location: null | Location
  @observable error: null | Error

  @observable state: RouterStateTree

  // Create a map of all nodes in tree so we can perform faster lookup.
  // Instances should be exactly the same as in state tree.
  @observable lookup: ObservableMap<RouteNode>

  // Keep a list of activated nodes so we can track differences when
  // transitioning to a new state.
  @observable activeNodes: IObservableArray<RouteNode>

  constructor() {
    // Initial empty root.
    const root = createRouteNode({
      path: '',
      children: []
    })

    this.location = null

    this.error = null

    this.lookup = observable.map({
      [root.value.key]: root
    })

    this.activeNodes = observable.array([])

    this.state = new RouterStateTree(root)
  }

  @action
  replaceChildren(parent: RouteNode, nodes: RouteNode[]) {
    const existing = this.lookup.get(parent.value.key)
    if (existing) {
      existing.children.replace(nodes)
      nodes.forEach(child => {
        this.lookup.set(child.value.key, child)
      })
    } else {
      throw new Error('Could not add children to a node that does not belong in tree.')
    }
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
  setError(err: Error) {
    this.error = err
  }
}

export default RouterStore
