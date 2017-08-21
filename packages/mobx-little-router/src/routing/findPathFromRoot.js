// @flow
import { findPath } from '../util/tree'
import type { MatchResult, Params, RouteNode } from './types'

type ShouldContinue = boolean

export type OnExhaustedFn = (node: RouteNode) => Promise<ShouldContinue>

export default async function findPathFromRoot(
  node: RouteNode,
  url: string,
  onExhausted: OnExhaustedFn
): Promise<MatchResult[]> {
  const matchedParams: { [string]: Params | null } = {}
  const matchedRemaining: { [string]: string } = {}
  let _remaining = url

  const path = await findPath(
    (node: RouteNode) => {
      const { matched, params, remaining } = node.value.matcher(_remaining)
      matchedParams[node.value.key] = params
      matchedRemaining[node.value.key] = remaining
      _remaining = remaining
      return Promise.resolve(matched)
    },
    node,
    onExhausted
  )

  return path.map(node => ({
    node,
    remaining: matchedRemaining[node.value.key] || '',
    params: matchedParams[node.value.key] || {}
  }))
}
