// @flow
import type { RouteNode } from '../routing/types'
import { findPath } from '../util/tree'
import type { MatchResult } from './types'

type ShouldContinue = boolean

export type OnExhaustedFn = (node: RouteNode) => Promise<ShouldContinue>

export default async function findPathFromRoot(node: RouteNode, path: string[], onExhausted: OnExhaustedFn): Promise<MatchResult[]> {
  const matched: MatchResult[] = []
  await findPath(
    (node: RouteNode, segment) => {
      const { value: { pattern, path } } = node

      // Try to match pattern if it exists.
      if (pattern !== null) {
        const params = pattern.match(segment)
        if (params !== null) {
          matched.push({ node, segment, params })
          return Promise.resolve(true)
        }
        // If pattern does not existing, we need to match on empty string (index route).
      } else if (path === segment) {
        matched.push({ node, segment, params: {} })
        return Promise.resolve(true)
      }

      // No match.
      return Promise.resolve(false)
    },
    onExhausted,
    node,
    path
  )

  return matched
}
