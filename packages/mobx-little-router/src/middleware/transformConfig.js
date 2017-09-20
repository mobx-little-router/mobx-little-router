// @flow
import { EventTypes } from '../events'
import transformEventType from './transformEventType'

/*
 * Takes a config mapper and create a middleware that will map over loaded configuration objects.
 */
export default (f: (x: any) => any) =>
  transformEventType(EventTypes.CHILDREN_LOADING)(evt => {
    const { children } = evt
    return {
      ...evt,
      children: mapChildren(f, children)
    }
  })

function mapChildren(f, children) {
  if (children && children.length) {
    return children.map(x => {
      return {
        ...f(x),
        children: mapChildren(f, x.children)
      }
    })
  } else {
  return children
  }
}
