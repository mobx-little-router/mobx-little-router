import type { RouteStateTreeNode } from './types'

export default function createRouteKey(node: RouteStateTreeNode<*, *>, segment: string) {
  return `${node.value.key}${segment.toString()}`
}
