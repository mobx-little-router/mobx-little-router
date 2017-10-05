// @flow
import { EventTypes } from '../events'
import transformEventType from './transformEventType'

/*
 * Takes a config mapper and create a middleware that will map over loaded configuration objects.
 */
export default (f: (x: any, y: any) => any) =>
  transformEventType(EventTypes.CHILDREN_LOADING)((evt, store) => {
    const { children } = evt
    return {
      ...evt,
      children: mapChildren(f, store, children)
    }
  })

function mapChildren(f, store, children) {
  if (children && children.length) {
    return children.map(x => {
      return {
        ...f(x, store),
        children: mapChildren(f, store, x.children)
      }
    })
  } else {
  return children
  }
}
