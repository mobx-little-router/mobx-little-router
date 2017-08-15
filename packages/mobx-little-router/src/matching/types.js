// @flow
import type { RouteNode } from '../routing/types'
import type { Params } from '../history/types'

export type MatchResult = {
  node: RouteNode,
  segment: string,
  params: Params
}
