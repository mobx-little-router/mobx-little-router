// @flow
import type { Params, RouteNode } from '../routing/types'

export type MatchResult = {
  node: RouteNode,
  params: Params
}
