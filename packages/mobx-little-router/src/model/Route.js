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
import { string, optional, func, createValidator } from '../validation'

async function nop() {}

// Don't run validators in production bundle
const validate = createValidator({
  path: string,
  loadChildren: optional(func),
  onError: optional(func),
  canActivate: optional(func),
  canDeactivate: optional(func),
  onTransition: optional(func),
  onEnter: optional(func),
  onLeave: optional(func)
})

type GetContext = () => *

export default function Route(config: Config, getContext: ?GetContext): RouteNode<*> {
  const matcher = config.match ? m[config.match] : m.partial

  validate(config)

  getContext = typeof getContext === 'function' ? getContext : (() => ({}))

  return TreeNode(
    {
      key: typeof config.key === 'string' ? config.key : createKey(6),
      path: config.path,
      matcher: matcher(config.path),
      data: config.data || {},
      params: config.data || {},

      loadChildren: toLoadRouteNodeChildren(config.loadChildren),

      // Guards
      canActivate: config.canActivate || nop,
      canDeactivate: config.canDeactivate || nop,

      // Lifecycle callback
      onError: config.onError || null,
      onTransition: config.onTransition || null,
      onEnter: config.onEnter || nop,
      onLeave: config.onLeave || nop,
      getContext
    },
    config.children ? config.children.map(x => (
      // Chains the context down to children.
      Route(x, getContext)
    )) : []
  )
}

function toLoadRouteNodeChildren(f: void | LoadChildrenConfigFn): null | LoadChildrenRouteNode {
  const g = f // Avoid re-binding type errors on f.
  if (typeof g === 'undefined') {
    return null
  } else {
    return () => g().then(nodes => nodes.map(x => Route(x)))
  }
}
