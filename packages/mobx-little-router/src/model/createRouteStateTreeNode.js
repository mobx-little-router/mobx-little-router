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

  const willActivate = typeof config.redirectTo === 'string'
    ? (node: *, navigation: *, context: *) => navigation.redirectTo((config: any).redirectTo)
    : typeof config.willActivate === 'function' ? config.willActivate : nop

  return TreeNode(
    {
      key: typeof config.key === 'string' ? config.key : createKey(6),
      path: config.path,
      matcher: matcher(config.path),
      params: config.params !== null ? config.params: {},
      loadChildren: typeof config.loadChildren === 'function'
        ? toLoadRouteStateTreeNodeChildren(config.loadChildren)
        : null,
      // Guards
      canActivate: typeof config.canActivate === 'function' ? config.canActivate : nop,
      canDeactivate: typeof config.canDeactivate === 'function'
        ? config.canDeactivate
        : nop,
      willActivate,
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
  switch (config.path) {
    // Catch-all matcher for handling "Not Found", etc.
    case '**':
      return m.any
    default:
      return config.match ? m[config.match] : m.partial
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
