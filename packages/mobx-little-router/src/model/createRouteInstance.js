// @flow
import { observable, extendObservable } from 'mobx'
import qs from 'querystring'
import createRouteKey from './createRouteKey'
import type { Params, Query, Route, RouteStateTreeNode } from './types'

export default function createRouteInstance<C: Object, D: Object>(node: RouteStateTreeNode<C, D>, parentUrl: string, segment: string, params: Params, query: Query): Route<C,D> {  
  const route = observable({
    node,
    key: createRouteKey(node, `${parentUrl}:${segment}:${qs.stringify(query)}`),
    value: `${parentUrl}${segment}?${qs.stringify(query)}`,
    parentUrl,
    segment,
    params,
    query,
    state: { ...node.value.state },
    context: node.value.getContext(),
    onTransition: node.value.onTransition,
    disposers: []
  }, {
    node: observable.ref,
    context: observable.ref
  })

  extendObservable(route, {
    computed: node.value.computed(route),
    effects: node.value.effects(route),
    data: node.value.getData(route)
  })

  return route
}
