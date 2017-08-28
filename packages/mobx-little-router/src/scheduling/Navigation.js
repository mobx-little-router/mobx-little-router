// @flow
import type { Href, Location } from '../model/types'

/*
 * The transition object encodes information about the type of transition
 * as well as the to/from location. It is passed to the guard function,
 * and can optionally be used a the return type of the guard as well, in
 * order to let the Scheduler know where to transition to next.
 */

export const NavigationTypes = {
  PUSH: 'PUSH',
  REPLACE: 'REPLACE',
  GO_BACK: 'GO_BACK'
}

type NavigationType = $Keys<typeof NavigationTypes>

type Definition = {
  type: NavigationType,
  to?: Location,
  from?: Location
}

export default class Transition {
  type: NavigationType
  to: null | Location
  from: null | Location

  constructor(x: Definition) {
    this.type = x.type
    this.to = x.to || null
    this.from = x.from || null
  }

  redirectTo(href: Href) {
    return Promise.reject(new Transition({
      type: NavigationTypes.PUSH,
      from: this.from,
      to: asLocation(href)
    }))
  }

  goBack() {
    return Promise.reject(new Transition({
      type: NavigationTypes.GO_BACK,
      from: this.to,
      to: null
    }))
  }
}

function asLocation(href: Href): Location {
  return typeof href === 'string' ? { pathname: href } : href
}
