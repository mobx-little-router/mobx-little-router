// @flow

import type Navigation from '../model/Navigation'

const getNavigationUrl = (navigation: ?Navigation) =>
  navigation && navigation.to ? navigation.to.pathname : 'UNKNOWN_URL'

export class RouteError {
  navigation: ?Navigation
  status: ?number
  message: ?string

  constructor(navigation: ?Navigation, status: ?number, message: ?string) {
    this.navigation = navigation
    this.status = typeof status === 'number' ? status : null
    this.message = message
  }

  toString() {
    return typeof this.message === 'string' ? this.message : 'Unknown RouteError'
  }
}

export class NotFound extends RouteError {
  constructor(navigation: ?Navigation) {
    super(navigation, 404, `Not found ${getNavigationUrl(navigation)}`)
  }
}

export class Unauthorized extends RouteError {
  constructor(navigation: ?Navigation) {
    super(navigation, 403, `Unauthorized access to ${getNavigationUrl(navigation)}`)
  }
}

export class BadRequest extends RouteError {
  constructor(navigation: ?Navigation) {
    super(navigation, 400, `Bad request to ${getNavigationUrl(navigation)}`)
  }
}
