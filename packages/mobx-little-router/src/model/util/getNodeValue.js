// @flow
import { type PathElement, type Route } from '../types'

export default function getNodeValue<C: {}, D: {}>(key: string, obj: null | Route<C, D> | PathElement<C, D>) {
  if (obj) {
    return obj.node.value[key] || null
  } else {
    return null
  }
}
