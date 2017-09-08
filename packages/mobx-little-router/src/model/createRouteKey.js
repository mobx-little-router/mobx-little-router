import * as QueryString from 'qs'
import type { Query, RouteStateTreeNode } from './types'

export default function createRouteKey(node: RouteStateTreeNode<*, *>, segment: string, query: Query) {
  let key = `${node.value.key}${segment.toString()}`
  const queryString = QueryString.stringify(query)

  if (queryString) {
    key += `?${queryString}`
  }

  return key
}
