// @flow
import type { RouteNode } from '../model/types'

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

export class InvalidTransition extends Error{
  transition: *
  constructor(transition: *) {
    super('Invalid transition')
    this.transition = transition
  }
}
