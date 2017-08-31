// @flow
import type { ActivatedRoute } from '../model/types'
import Navigation from '../model/Navigation'

export class TransitionFailure  {
  route: ActivatedRoute<*, *>
  navigation: null | Navigation
  constructor(route: ActivatedRoute<*, *>, navigation: ?Navigation) {
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

export class InvalidNavigation {
  transition: *
  constructor(transition: *) {
    this.transition = transition
  }
}
