// @flow
import { type PathElement } from '../types'

export default function setNodeValue<C: {}, D: {}>(key: string, value: *,element: ?PathElement<C, D>) {
  if (element) {
    return element.node.value[key] = value
  }
}
