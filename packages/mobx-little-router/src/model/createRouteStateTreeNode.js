// @flow
import type {
  Config,
  RouteStateTreeNode,
  LoadChildrenConfigFn,
  LoadChildrenRouteStateTreeNode
} from './types'
import { TreeNode } from '../util/tree'
import createKey from '../util/createKey'
import * as m from './matchers'
import { array, string, optional, func, createValidator } from '../validation'

async function nop() {}

// Don't run validators in production bundle
const validate = createValidator({
  path: string,
  children: optional(array),
  loadChildren: optional(func),
  onError: optional(func),
  canActivate: optional(func),
  canDeactivate: optional(func),
  onTransition: optional(func),
  willActivate: optional(func),
  willDeactivate: optional(func)
})

type GetContext = () => *

export default function createRouteStateTreeNode(config: Config<*>, getContext: ?GetContext): RouteStateTreeNode<*, *> {
  const matcher = getMatcher(config)

  validate(config)

  getContext = typeof getContext === 'function' ? getContext : () => ({})

  const children = typeof config.children !== 'undefined'
    ? config.children.map(x =>
        // Chains the context down to children.
        createRouteStateTreeNode(x, getContext)
      )
    : []

  return TreeNode(
    {
      key: typeof config.key === 'string' ? config.key : createKey(6),
      path: config.path,
      matcher: matcher(config.path),
      query: typeof config.query !== 'undefined' ? config.query : [],
      loadChildren: typeof config.loadChildren === 'function'
        ? toLoadRouteStateTreeNodeChildren(config.loadChildren)
        : null,
      // Guards
      canActivate: typeof config.canActivate === 'function' ? config.canActivate : nop,
      canDeactivate: typeof config.canDeactivate === 'function'
        ? config.canDeactivate
        : nop,
      willActivate: getWillActivate(config),
      willDeactivate: typeof config.willDeactivate === 'function'
        ? config.willDeactivate
        : nop,
      // Lifecycle callback
      onError: typeof config.onError === 'function' ? config.onError : null,
      onTransition: typeof config.onTransition === 'function'
        ? config.onTransition
        : null,
      getContext,
      getData: typeof config.getData === 'function' ? config.getData : () => ({})
    },
    children
  )
}

export function getMatcher(config: Config<*>) {
  if (config.path === '**') {
    // Catch-all matcher for handling "Not Found", etc.
    return m.any
  }

  if (config.match) {
    // Match was specified.
    return m[config.match]
  }

  if (!config.children &&  typeof config.loadChildren !== 'function') {
    // If we are in a leaf node, then match must be full.
    return m.full
  }

  // Otherwise we default to partial.
  return m.partial
}

export function getWillActivate(config: Config<*>) {
  let f = typeof config.willActivate === 'function' ? config.willActivate : nop

  if (typeof config.redirectTo === 'string') {
    return (node: *, navigation: *, context: *) => navigation.redirectTo((config: any).redirectTo)
  } else {
    return f
  }
}

function toLoadRouteStateTreeNodeChildren(f: void | LoadChildrenConfigFn<*>): null | LoadChildrenRouteStateTreeNode {
  const g = f // Avoid re-binding type errors on f.
  if (typeof g === 'undefined') {
    return null
  } else {
    return () => g().then(nodes => nodes.map(x => createRouteStateTreeNode(x)))
  }
}
