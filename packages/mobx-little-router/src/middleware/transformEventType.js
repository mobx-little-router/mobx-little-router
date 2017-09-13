// @flow
import Middleware from './Middleware'
import type { Computation } from './Middleware'
import { EventTypes } from '../events'

export default (type: $Keys<typeof EventTypes>) => (f: Computation) => Middleware((evt: *): * => {
  switch (evt.type) {
    case type:
      return f(evt)
    default:
      return evt
  }
})
