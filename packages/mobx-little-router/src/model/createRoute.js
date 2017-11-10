// @flow
import { observable } from 'mobx'
import qs from 'querystring'
import createRouteKey from './createRouteKey'
import type { Params, Query, Route, RouteStateTreeNode } from './types'

export default function createRoute<C: Object, D: Object>(node: RouteStateTreeNode<C, D>, parentUrl: string, segment: string, params: Params, query: Query): Route<C,D> {
  const key = createRouteKey(node, parentUrl, segment)
  return observable({
    node: node,
    key,
    value: `${node.value.key}${parentUrl}${segment}?${qs.stringify(query)}`,
    parentUrl,
    segment,
    params,
    query,
    context: observable.ref(node.value.getContext()),
    data: node.value.getData(),
    onTransition: node.value.onTransition
  })
}
