// @flow
import type { MatchResult } from './matching/types'
import type { Params, RouteNode } from './routing/types'

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
  parts: string[]
  path: MatchResult[]
  constructor(parts: string[], path: MatchResult[]) {
    this.parts = parts
    this.path = path
  }
  toString() {
    return `No match for parts ["${this.parts.join('", "')}"]`
  }
}
