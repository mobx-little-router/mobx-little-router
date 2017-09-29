// @flow
import type { Href, Location } from './types'

/*
 * The transition object encodes information about the type of transition
 * as well as the to/from location. It is passed to the guard function,
 * and can optionally be used a the return type of the guard as well, in
 * order to let the Scheduler know where to transition to next.
 */

export const NavigationTypes = {
  PUSH: 'PUSH',
  POP: 'POP',
  REPLACE: 'REPLACE',
  GO_BACK: 'GO_BACK'
}

export type NavigationType = $Keys<typeof NavigationTypes>

export type NavigationDescriptor = {
  type: NavigationType,
  sequence?: number,
  to: Location,
  from?: Location,
  shouldTransition?: boolean
}

export default class Navigation {
  type: NavigationType
  to: Location
  from: null | Location
  sequence: number
  shouldTransition: boolean

  static EMPTY = new Navigation({
    type: NavigationTypes.POP,
    to: null
  })

  constructor(x: NavigationDescriptor) {
    this.type = x.type
    this.sequence = x.sequence || 0
    this.to = x.to || null
    this.from = x.from || null
    this.shouldTransition = typeof x.shouldTransition === 'boolean' ? x.shouldTransition : this.sequence > 0
  }

  next(next: NavigationDescriptor) {
    return new Navigation({
      type: next.type,
      sequence: this.sequence + 1,
      from: this.to,
      to: next.to
    })
  }

  prev() {
    return new Navigation({
      type: NavigationTypes.GO_BACK,
      sequence: this.sequence + 1,
      from: this.to,
      to: null
    })
  }

  redirectTo(href: Href) {
    return Promise.reject(this.next({
      type: 'PUSH',
      to: asLocation(href)
    }))
  }

  goBack() {
    return Promise.reject(this.prev())
  }
}

function asLocation(href: Href): Location {
  return typeof href === 'string' ? { pathname: href } : href
}
