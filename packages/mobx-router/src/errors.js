// @flow
import type { RouteNode } from './routing/types'
import type { Params } from './history/types'

export class GuardFailure {
  error: any
  node: RouteNode
  params: Params
  constructor(error: any, node: RouteNode, params: Params) {
    this.error = error
    this.node = node
    this.params = params
  }
}
