// @flow
import { EventTypes } from '../events'
import transformEventType from './transformEventType'

/*
 * Takes a config mapper and create a middleware that will map over loaded configuration objects.
 */
export default (f: (x: any) => any) =>
  transformEventType(EventTypes.CHILDREN_LOAD)(evt => {
    const { children } = evt
    if (children && children.length) {
      return {
        ...evt,
        children: children.map(f)
      }
    } else {
      return evt
    }
  })
