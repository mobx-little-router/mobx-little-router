// @flow
import type { MatchResult, Params, RouteNode } from './routing/types'

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

export class NoMatch {
  url: string
  path: any[]
  constructor(url: string, path: MatchResult[]) {
    this.url = url
    this.path = path
  }
  toString() {
    return `No match for url "${this.url}"`
  }
}

export class NavigationError {
  node: RouteNode
  params: Params
  constructor(node: RouteNode, params: Params) {
    this.node = node
    this.params = params
  }
  toString() {
    return 'Unhandled navigation error'
  }
}
