// @flow
import type { MatchResult, RouteNode } from './routing/types'

export class GuardFailure extends Error {
  node: RouteNode
  constructor(type: string, node: RouteNode) {
    super(`${type} guard failed at node ${node.value.key}`)
    this.node = node
  }
}

export class NoMatch extends Error {
  url: string
  constructor(url: string) {
    super(`No match for ${url}`)
    this.url = url
  }
}

export class NavigationError extends Error {
  node: RouteNode
  constructor(node: RouteNode) {
    super(`Navigation failed at ${node.value.key}`)
    this.node = node
  }
}
