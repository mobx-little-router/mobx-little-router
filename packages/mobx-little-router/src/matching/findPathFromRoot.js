// @flow
import { findPath } from '../util/tree'
import type { Params, RouteNode } from '../routing/types'

type ShouldContinue = boolean

export type OnExhaustedFn = (node: RouteNode) => Promise<ShouldContinue>

export type MatchResult = {
  node: RouteNode,
  params: Params
}

export default async function findPathFromRoot(
  node: RouteNode,
  segments: string[],
  onExhausted: OnExhaustedFn
): Promise<MatchResult[]> {
  const matchedParams: { [string]: Params } = {}
  const path = await findPath(
    // TODO: We should install different matchers on the RouteNode instances instead of having this function know this muych logic.
    (node: RouteNode, remainingSegments: string[]) => {
      const { value: { key, pattern, path } } = node
      const segment = remainingSegments[0]

      // Try to match params from current segment.
      if (pattern) {
        const params = pattern.match(segment)
        if (params) {
          matchedParams[key] = params
          return Promise.resolve({
            consumedSegments: [segment],
            lastSegmentIndex: 1
          })
        }
      }

      // Empty path means we consume the a segment, but we don't change the last segment index.
      if (path === '') {
        matchedParams[key] = {}
        return Promise.resolve({
          consumedSegments: [''],
          lastSegmentIndex: 0
        })
      }

      // No matches.
      return Promise.resolve({
        consumedSegments: [],
        lastSegmentIndex: 0
      })
    },
    onExhausted,
    node,
    segments
  )

  return path.map(node => ({
    node,
    params: matchedParams[node.value.key]
  }))
}
