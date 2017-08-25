// @flow
import type { Href, Location } from '../routing/types'

const TransitionTypes = {
  PUSH: 'PUSH',
  REPLACE: 'REPLACE',
  GO_BACK: 'GO_BACK'
}

type TransitionType = $Keys<typeof TransitionTypes>

type Definition = {
  type: TransitionType,
  to?: Location,
  from?: Location
}

export class _Transition {
  type: TransitionType
  to: null | Location
  from: null | Location

  constructor(x: Definition) {
    this.type = x.type
    this.to = x.to || null
    this.from = x.from || null
  }

  redirectTo(href: Href) {
    return Promise.reject(Transition({
      type: TransitionTypes.PUSH,
      from: this.from,
      to: asLocation(href)
    }))
  }

  goBack() {
    return Promise.reject(Transition({
      type: TransitionTypes.GO_BACK,
      from: this.to,
      to: null
    }))
  }
}

export default function Transition(x: Definition) {
  return new _Transition(x)
}

function asLocation(href: Href): Location {
  return typeof href === 'string' ? { pathname: href } : href
}
