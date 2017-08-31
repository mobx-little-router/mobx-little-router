// @flow
import type { Params, Route, RouteStateTreeNode } from './types'

export default function createRoute<C,D>(node: RouteStateTreeNode<C,D>, params: Params, segment: string): Route<C,D> {
  return {
    node: node,
    key: node.value.key,
    segment,
    params,
    context: node.value.getContext(),
    data: node.value.getData(),
    onTransition: node.value.onTransition
  }
}
