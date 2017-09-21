// @flow
import type { Route } from '../model/types'
import Navigation from '../model/Navigation'

export class TransitionFailure  {
  route: Route<*, *>
  navigation: null | Navigation
  constructor(route: Route<*, *>, navigation: ?Navigation) {
    this.route = route
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
