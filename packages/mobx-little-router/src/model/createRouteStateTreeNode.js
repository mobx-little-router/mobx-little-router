// @flow
import { observable, extendObservable } from 'mobx'
import type { Config, RouteStateTreeNode } from './types'
import { TreeNode } from '../util/tree'
import defaultCreateKey from '../util/createKey'
import * as m from './matchers'
import { array, string, optional, func, createValidator } from '../validation'
import UrlPattern from 'url-pattern'

function NOP(a: *, b: *) {
  return Promise.resolve()
}

// Don't run validators in production bundle
const validate = process.env.NODE_ENV === 'production'
  ? createValidator({})
  : createValidator({
      path: string,
      children: optional(array),
      loadChildren: optional(func),
      onError: optional(func),
      canActivate: optional(func),
      canDeactivate: optional(func),
      onTransition: optional(func),
      onEnter: optional(func),
      onExit: optional(func),
      willActivate: optional(func),
      willDeactivate: optional(func),
      willResolve: optional(func),
      subscriptions: optional(func),
      computed: optional(func),
      effects: optional(func)
    })

type GetContext = () => *

export default function createRouteStateTreeNode(
  config: Config<*>,
  getContext: ?GetContext,
  createKey: (() => string) = defaultCreateKey
): RouteStateTreeNode<*, *> {
  const matcher = getMatcher(config)

  validate(config)

  getContext = typeof getContext === 'function' ? getContext : () => ({})

  const children = typeof config.children !== 'undefined'
    ? config.children.map(x =>
        // Chains the context down to children.
        createRouteStateTreeNode(x, getContext, createKey)
      )
    : []

  const pattern = new UrlPattern(config.path || '/')
  
  const value = observable({
    key: typeof config.key === 'string' ? config.key : createKey(),
    path: config.path,
    matcher: matcher(config.path),
    params: pattern.names,
    query: typeof config.query !== 'undefined' ? config.query : [],
    loadChildren: typeof config.loadChildren === 'function'
      ? config.loadChildren
      : null,
    canActivate: config.canActivate || NOP,
    canDeactivate: config.canDeactivate || NOP,
    willActivate: config.willActivate || NOP,
    willDeactivate: config.willDeactivate || NOP,
    willResolve: config.willResolve || NOP,
    onError: config.onError || null,
    onTransition: config.onTransition || null,
    onEnter: config.onEnter || null,
    onExit: config.onExit || null,
    getContext,
    getData: config.getData || (() => ({})),
    state: config.state || {},
    disposers: [],
    subscriptions: config.subscriptions || null,
    computed: config.computed || (() => ({})),
    effects: config.effects || (() => ({}))
  }, {
    matcher: observable.ref,
    loadChildren: observable.ref,
    canActivate: observable.ref,
    canDeactivate: observable.ref,
    willActivate: observable.ref,
    willDeactivate: observable.ref,
    willResolve: observable.ref,
    onError: observable.ref,
    onTransition: observable.ref,
    onEnter: observable.ref,
    onExit: observable.ref,
    getData: observable.ref,
    subscriptions: observable.ref,
    computed: observable.ref,
    effects: observable.ref
  })

  value.current = observable({
    params: value.params.reduce((acc, x) => {
      acc[x] = null
      return acc
    }, {}),
    query: value.query.reduce((acc, x) => {
      acc[x] = ''
      return acc
    }, {}),
    state: value.state
  }, {
    state: observable.ref
  })

  extendObservable(value.current, {
    computed: value.computed ? value.computed.bind(value.current)() : {}
  })

  return TreeNode(value, children)
}

export function getMatcher(config: Config<*>) {
  // Catch-all matcher for handling "NotFound", etc.
  if (config.path === '**') return m.any

  // Match was specified.
  if (config.match) return m[config.match]

  // If we are in a leaf node, then match must be full.
  if (!config.children && typeof config.loadChildren !== 'function') return m.full

  // Otherwise we default to partial.
  return m.partial
}
