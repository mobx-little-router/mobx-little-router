// @flow
import type { Params, Route, RouteStateTreeNode } from './types'
import { observable } from 'mobx'

export default function createRoute<C: Object,D: Object>(node: RouteStateTreeNode<C,D>, params: Params, segment: string): Route<C,D> {
  return observable({
    node: node,
    key: `${node.value.key}${segment.toString()}`,
    segment,
    params,
    context: observable.ref(node.value.getContext()),
    data: { ...node.value.getData(), transitionState: null },
    onTransition: node.value.onTransition
  })
}
