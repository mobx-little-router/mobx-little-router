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
  segments: string[]
  path: MatchResult[]
  constructor(segments: string[], path: MatchResult[]) {
    this.segments = segments
    this.path = path
  }
  toString() {
    return `No match for segments ["${this.segments.join('", "')}"]`
  }
}
