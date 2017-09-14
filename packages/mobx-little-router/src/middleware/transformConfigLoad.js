// @flow
import { EventTypes } from '../events'
import transformEventType from './transformEventType'

/*
 * Takes a config mapper and create a middleware that will map over loaded configuration objects.
 */
export default (f: (x: any) => any) =>
  transformEventType(EventTypes.CHILDREN_CONFIG_LOAD)(evt => {
    const { module } = evt
    if (module) {
      return {
        ...evt,
        module: f(module)
      }
    } else {
      return evt
    }
  })
