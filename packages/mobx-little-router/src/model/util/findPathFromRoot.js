// @flow
import { findPath } from '../../util/tree'
import type { PathElement, Params, RouteStateTreeNode } from '../types'

export default function findPathFromRoot(
  node: RouteStateTreeNode<*, *>,
  url: string,
  initialParams: ?Object
): PathElement<*, *>[] {
  const matchedParams: { [string]: Params | null } = {}
  const matchedRemaining: { [string]: string } = {}
  const matchedSegment: { [string]: string } = {}
  const matchedParentUrl: { [string]: string } = {}
  let _remaining = url
  let _params = initialParams || {}

  const path = findPath(
    (node: RouteStateTreeNode<*, *>) => {
      const { matched, params, remaining, segment } = node.value.matcher(_remaining)
      _params = { ..._params, ...params }
      matchedParams[node.value.key] = _params
      matchedParentUrl[node.value.key] = _remaining
      matchedRemaining[node.value.key] = remaining
      matchedSegment[node.value.key] = segment
      _remaining = remaining
      return matched
    },
    node
  )

  return path.map(node => ({
    node,
    parentUrl: matchedParentUrl[node.value.key] || '',
    segment: matchedSegment[node.value.key] || '',
    remaining: matchedRemaining[node.value.key] || '',
    params: matchedParams[node.value.key] || {}
  }))
}
