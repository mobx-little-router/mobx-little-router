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

export default function createRouteNode(config: Config): RouteNode {
  const matcher = config.match ? m[config.match] : m.partial
  return new TreeNode(
    {
      key: createKey(6),
      path: config.path,
      matcher: matcher(config.path),
      data: config.data || {},
      params: null,
      loadChildren: toLoadRouteNodeChildren(config.loadChildren),
      hooks: {
        canActivate: config.canActivate || [alwaysContinue],
        onEnter: config.onEnter || [alwaysContinue],
        onError: config.onError || [],
        onLeave: config.onLeave || [alwaysContinue],
        canDeactivate: config.canDeactivate || [alwaysContinue]
      }
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
