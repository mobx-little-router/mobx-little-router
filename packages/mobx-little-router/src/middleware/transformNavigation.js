// @flow
import { EventTypes } from '../events'
import transformEventType from './transformEventType'

/*
 * Takes a config mapper and create a middleware that will map over loaded configuration objects.
 */
export default (f: (x: any) => any) =>
  transformEventType(EventTypes.NAVIGATION_START)(evt => {
    const { navigation } = evt
    if (navigation) {
      return {
        ...evt,
        navigation: f(navigation)
      }
    } else {
      return evt
    }
  })
