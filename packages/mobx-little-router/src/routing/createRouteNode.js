// @flow
import type {
  Config,
  RouteNode,
  LoadChildrenConfigFn,
  LoadChildrenRouteNode
} from './types'
import { TreeNode } from '../util/tree'
import createKey from '../util/createKey'
import * as m from './matchers'

function alwaysContinue(__: *, ___: *) {
  return Promise.resolve()
}

function nop() {}

export default function createRouteNode(config: Config): RouteNode {
  const matcher = config.match ? m[config.match] : m.partial
  return new TreeNode(
    {
      key: config.key || createKey(6),
      path: config.path,
      matcher: matcher(config.path),
      data: config.data || {},
      params: config.data || {},
      loadChildren: toLoadRouteNodeChildren(config.loadChildren),

      // Guards
      canActivate: config.canActivate || alwaysContinue,
      canDeactivate: config.canDeactivate || alwaysContinue,

      // Lifecycle callback
      onEnter: config.onEnter || nop,
      onError: config.onError || null,
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
