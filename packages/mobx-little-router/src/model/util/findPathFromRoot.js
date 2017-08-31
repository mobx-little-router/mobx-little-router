// @flow
import { findPath } from '../../util/tree'
import type { MatchResult, Params, RouteStateTreeNode } from '../types'

type ShouldContinue = boolean

export type OnExhaustedFn = (node: RouteStateTreeNode<*, *>) => Promise<ShouldContinue>

export default async function findPathFromRoot(
  node: RouteStateTreeNode<*, *>,
  url: string,
  onExhausted: OnExhaustedFn
): Promise<MatchResult<*, *>[]> {
  const matchedParams: { [string]: Params | null } = {}
  const matchedRemaining: { [string]: string } = {}
  const matchedSegment: { [string]: string } = {}
  let _remaining = url

  const path = await findPath(
    (node: RouteStateTreeNode<*, *>) => {
      const { matched, params, remaining, segment } = node.value.matcher(_remaining)
      matchedParams[node.value.key] = params
      matchedRemaining[node.value.key] = remaining
      matchedSegment[node.value.key] = segment
      _remaining = remaining
      return Promise.resolve(matched)
    },
    node,
    onExhausted
  )

  return path.map(node => ({
    node,
    segment: matchedSegment[node.value.key] || '',
    remaining: matchedRemaining[node.value.key] || '',
    params: matchedParams[node.value.key] || {}
  }))
}
