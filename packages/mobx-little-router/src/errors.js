// @flow
import type { MatchResult, RouteNode } from './routing/types'

export class GuardFailure {
  error: any
  node: RouteNode
  constructor(error: any, node: RouteNode) {
    this.error = error
    this.node = node
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
  constructor(node: RouteNode) {
    this.node = node
  }
  toString() {
    return 'Unhandled navigation error'
  }
}
