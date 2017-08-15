// @flow
import type {
  Config,
  RouteNode,
  LoadChildrenConfigFn,
  LoadChildrenRouteNode
} from './types'
import { TreeNode } from '../util/tree'
import createKey from '../util/createKey'
import UrlPattern from 'url-pattern'

function alwaysContinue(__: *, ___: *) {
  return Promise.resolve()
}

export default function createRouteNode(config: Config): RouteNode {
  let node = null
  const segments = config.path.split('/')
  let idx = segments.length - 1

  // Expands the path so that a/b/c generates three nodes a -> b -> c.
  while (idx >= 0) {
    const curr = segments[idx]
    node = new TreeNode(
      {
        key: createKey(6),
        path: curr,
        data: node !== null ? {} : config.data || {},
        pattern: curr !== '' ? new UrlPattern(curr) : null,
        params: null,
        isActive: false,
        loadChildren: node !== null
          ? null
          : toLoadRouteNodeChildren(config.loadChildren),
        hooks: node !== null
          ? {}
          : {
              canActivate: config.canActivate || [alwaysContinue],
              onEnter: config.onEnter || [alwaysContinue],
              onError: config.onError || [],
              onLeave: config.onLeave || [alwaysContinue],
              canDeactivate: config.canDeactivate || [alwaysContinue]
            }
      },
      node !== null ? [node] : config.children ? config.children.map(createRouteNode) : []
    )
    idx--
  }

  if (node) {
    return node
  } else {
    throw new Error('Failed to build node')
  }
}

function toLoadRouteNodeChildren(f: void | LoadChildrenConfigFn): null | LoadChildrenRouteNode {
  const g = f // Avoid re-binding type errors on f.
  if (typeof g === 'undefined') {
    return null
  } else {
    return () => g().then(nodes => nodes.map(createRouteNode))
  }
}
