// @flow
import { observable, extendObservable } from 'mobx'
import qs from 'querystring'
import createRouteKey from './createRouteKey'
import type { Params, Query, Route, RouteStateTreeNode } from './types'

export default function createRouteInstance<C: Object, D: Object>(node: RouteStateTreeNode<C, D>, parentUrl: string, segment: string, params: Params, query: Query): Route<C,D> {
  const url = `${parentUrl}${segment}`
  const key = createRouteKey(node, url)

  const route = observable({
    node: node,
    key,
    value: `${url}?${qs.stringify(query)}`,
    parentUrl,
    segment,
    params,
    query,
    context: node.value.getContext(),
    data: node.value.getData(),
    onTransition: node.value.onTransition
  }, {
    context: observable.ref
  })

  extendObservable(route, {
    model: node.value.computed(route)
  })

  return route
}
