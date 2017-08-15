// @flow
import type { Params, RouteNode } from '../routing/types'

export type MatchResult = {
  node: RouteNode,
  segment: string,
  params: Params
}
