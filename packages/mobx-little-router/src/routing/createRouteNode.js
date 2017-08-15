// @flow
import type { Config, RouteValue } from './types'
import { TreeNode } from '../util/tree'
import createKey from '../util/createKey'
import UrlPattern from 'url-pattern'

function alwaysContinue(__: *, ___: *) {
  return Promise.resolve()
}

export default function createRouteNode(config: Config): TreeNode<RouteValue> {
  let node = null
  const parts = config.path.split('/')
  let idx = parts.length - 1

  // Expands the path so that a/b/c generates three nodes a -> b -> c.
  while (idx >= 0) {
    const curr = parts[idx]
    node = new TreeNode(
      {
        key: createKey(6),
        path: curr,
        data: node !== null ? {} : (config.data || {}),
        pattern: curr !== '' ? new UrlPattern(curr) : null,
        params: null,
        isActive: false,
        hooks: node !== null ? {} : {
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
