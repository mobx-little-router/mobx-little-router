// @flow
import type {
  Config,
  RouteNode,
  LoadChildrenConfigFn,
  LoadChildrenRouteNode
} from './types'
import { createTreeNode } from '../util/tree'
import createKey from '../util/createKey'
import * as m from './matchers'

async function nop() {}

export default function createRouteNode(config: Config): RouteNode {
  const matcher = config.match ? m[config.match] : m.partial
  if (typeof config.path !== 'string') {
    throw new TypeError('Invalid route node configuration')
  }
  return createTreeNode(
    {
      key: typeof config.key === 'string' ? config.key : createKey(6),
      path: config.path,
      matcher: matcher(config.path),
      data: config.data || {},
      params: config.data || {},
      isTransitioning: config.isTransitioning || false,

      loadChildren: toLoadRouteNodeChildren(config.loadChildren),

      // Guards
      canActivate: config.canActivate || nop,
      canDeactivate: config.canDeactivate || nop,

      // Lifecycle callback
      onError: config.onError || null,
      onTransition: config.onTransition || null,
      onEnter: config.onEnter || nop,
      onLeave: config.onLeave || nop
    },
    config.children ? config.children.map(createRouteNode) : []
  )
}

function toLoadRouteNodeChildren(f: void | LoadChildrenConfigFn): null | LoadChildrenRouteNode {
  const g = f // Avoid re-binding type errors on f.
  if (typeof g === 'undefined') {
    return null
  } else {
    return () => g().then(nodes => nodes.map(createRouteNode))
  }
}
