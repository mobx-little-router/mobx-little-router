// @flow
import { observable } from 'mobx'
import qs from 'querystring'
import createRouteKey from './createRouteKey'
import type { Params, Query, Route, RouteStateTreeNode } from './types'

export default function createRoute<C: Object, D: Object>(node: RouteStateTreeNode<C, D>, parentUrl: string, segment: string, params: Params, query: Query): Route<C,D> {
  const url = `${parentUrl}${segment}`
  const key = createRouteKey(node, url)

  return observable({
    node: node,
    key,
    value: `${url}?${qs.stringify(query)}`,
    parentUrl,
    segment,
    params,
    query,
    context: observable.ref(node.value.getContext()),
    data: node.value.getData(),
    onTransition: node.value.onTransition
  })
}
