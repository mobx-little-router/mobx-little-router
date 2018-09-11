// @flow
import { observable } from 'mobx'
import qs from 'querystring'
import createRouteKey from './createRouteKey'

import type { Params, Query, Route, RouteStateTreeNode } from '../types'

export default function createRouteInstance<C: Object, D: Object>(
  node: RouteStateTreeNode<C, D>,
  parentUrl: string,
  segment: string,
  params: Params,
  query: Query
): Route<C, D> {
  const disposers = []

  const route = observable(
    {
      node,
      key: createRouteKey(node, `${parentUrl}:${segment}:${qs.stringify(query)}`),
      value: `${parentUrl}${segment}?${qs.stringify(query)}`,
      parentUrl,
      segment,
      params,
      query,
      data: node.value.getData(),
      context: node.value.getContext(),
      onTransition: node.value.onTransition,
      model: node.value.model,
      dispose: () => disposers.forEach(f => f())
    },
    {
      node: observable.ref,
      data: observable.ref,
      dispose: observable.ref,
      context: observable.ref
    }
  )

  const { subscriptions } = node.value

  if (typeof subscriptions === 'function') {
    disposers.push(subscriptions(route))
  } else if (Array.isArray(subscriptions)) {
    subscriptions.forEach(subscribe => {
      disposers.push(subscribe(route))
    })
  }

  return route
}
