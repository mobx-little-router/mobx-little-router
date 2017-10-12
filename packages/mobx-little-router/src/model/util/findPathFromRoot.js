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
      const { matched, params, segment, parentUrl, remaining } = node.value.matcher(_remaining, url)

      _params = { ..._params, ...params }
      matchedParams[node.value.key] = _params
      matchedParentUrl[node.value.key] = parentUrl
      matchedSegment[node.value.key] = segment
      matchedRemaining[node.value.key] = remaining
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
