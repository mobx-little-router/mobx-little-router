// @flow
import type { Params } from '../history/types'
import type { RouteNode } from '../routing/types'

export type LifecycleFn = (node: RouteNode, params: Params) => Promise<void>
