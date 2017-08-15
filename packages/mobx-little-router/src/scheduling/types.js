// @flow
import type { Params, RouteNode } from '../routing/types'

export type LifecycleFn = (node: RouteNode, params: Params) => Promise<void>
