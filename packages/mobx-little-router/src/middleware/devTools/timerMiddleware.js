// @flow
import Middleware from '../Middleware'
import { runInAction } from 'mobx'
import { EventTypes } from '../../events'
import type { Event } from '../../events'

const timerMiddleware = function (now: () => number) {
  const timers = new Map()
  return Middleware((evt: Event): Event => {
    switch (evt.type) {
      case EventTypes.NAVIGATION_START: {
        const started = now()
        timers.set(evt.navigation.sequence, started)
        evt.elapsed = 0
        return evt
      }
      case EventTypes.NAVIGATION_CANCELLED:
      case EventTypes.NAVIGATION_END: {
        const { navigation } = evt
        if (navigation) {
          const started = timers.get(navigation.sequence)
          timers.delete(navigation.sequence)
          if (typeof started === 'number') {
            evt.elapsed = now() - started
          }
        }
        return evt
      }
      default: {
        const { navigation } = evt
        if (navigation) {
          const started = timers.get(navigation.sequence)
          if (typeof started === 'number') {
            evt.elapsed = now() - started
          }
        }
        return evt
      }
    }
  })
}

export default timerMiddleware
