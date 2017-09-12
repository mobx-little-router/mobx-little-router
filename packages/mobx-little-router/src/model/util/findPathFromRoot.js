// @flow
import { findPath } from '../../util/tree'
import type { PathElement, Params, RouteStateTreeNode } from '../types'

type ShouldContinue = boolean

export default function findPathFromRoot(
  node: RouteStateTreeNode<*, *>,
  url: string
): PathElement<*, *>[] {
  const matchedParams: { [string]: Params | null } = {}
  const matchedRemaining: { [string]: string } = {}
  const matchedSegment: { [string]: string } = {}
  let _remaining = url

  const path = findPath(
    (node: RouteStateTreeNode<*, *>) => {
      const { matched, params, remaining, segment } = node.value.matcher(_remaining)
      matchedParams[node.value.key] = params
      matchedRemaining[node.value.key] = remaining
      matchedSegment[node.value.key] = segment
      _remaining = remaining
      return matched
    },
    node
  )

  return path.map(node => ({
    node,
    segment: matchedSegment[node.value.key] || '',
    remaining: matchedRemaining[node.value.key] || '',
    params: matchedParams[node.value.key] || {}
  }))
}
