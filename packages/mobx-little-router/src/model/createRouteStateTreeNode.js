// @flow
import { observable } from 'mobx'
import type { Config, Route, RouteStateTreeNode } from './types'
import type Navigation from './Navigation'
import { TreeNode } from '../util/tree'
import createKey from '../util/createKey'
import * as m from './matchers'
import { array, string, optional, func, createValidator } from '../validation'
import UrlPattern from 'url-pattern'

async function nop(a: *, b: *) {}

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
  willDeactivate: optional(func),
  willResolve: optional(func)
})

type GetContext = () => *

export default function createRouteStateTreeNode(
  config: Config<*>,
  getContext: ?GetContext
): RouteStateTreeNode<*, *> {
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
    observable({
      key: typeof config.key === 'string' ? config.key : createKey(6),
      path: config.path,
      matcher: matcher(config.path),
      query: typeof config.query !== 'undefined' ? config.query : [],
      params: config.params !== null ? config.params : {},
      loadChildren: typeof config.loadChildren === 'function'
        ? config.loadChildren
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
      willResolve: typeof config.willResolve === 'function' ? config.willResolve : nop,
      onError: typeof config.onError === 'function' ? config.onError : null,
      onTransition: typeof config.onTransition === 'function'
        ? config.onTransition
        : null,
      getContext,
      getData: typeof config.getData === 'function' ? config.getData : () => ({}),
      etc: observable.ref(config.etc)
    }),
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

  if (!config.children && typeof config.loadChildren !== 'function') {
    // If we are in a leaf node, then match must be full.
    return m.full
  }

  // Otherwise we default to partial.
  return m.partial
}

// If a `redirectTo` has been specified on this route config, then the `willActivate`
// callback will redirect throw with a redirect.
export function getWillActivate(config: Config<*>) {
  let f = typeof config.willActivate === 'function' ? config.willActivate : nop
  if (typeof config.redirectTo === 'string') {
    const pattern = new UrlPattern(config.redirectTo)
    return (route: Route<*, *>, navigation: Navigation) => {
      f(route, navigation)
      return navigation.redirectTo(pattern.stringify(route.params))
    }
  } else {
    return f
  }
}
