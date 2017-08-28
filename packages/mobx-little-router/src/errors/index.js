// @flow
import type { RouteNode } from '../model/types'
import Navigation from '../model/Navigation'

export class GuardFailure  {
  node: RouteNode
  navigation: null | Navigation
  constructor(type: string, node: RouteNode, navigation: ?Navigation) {
    this.node = node
    this.navigation = navigation || null
  }
}

export class NoMatch  {
  url: string
  constructor(url: string) {
    this.url = url
  }
  toString() {
    return `No match for ${this.url}`
  }
}

export class InvalidTransition {
  transition: *
  constructor(transition: *) {
    this.transition = transition
  }
}
