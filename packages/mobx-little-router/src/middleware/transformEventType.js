// @flow
import Middleware from './Middleware'
import type { Computation } from './Middleware'
import { EventTypes } from '../events'

export default (type: $Keys<typeof EventTypes>) => (f: Computation) => Middleware((evt: *, store: *): * => {
  switch (evt.type) {
    case type:
      return f(evt, store)
    default:
      return evt
  }
})
