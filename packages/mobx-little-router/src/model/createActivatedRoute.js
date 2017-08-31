// @flow
import { observable } from 'mobx'
import type { Params, ActivatedRoute, RouteStateTreeNode } from './types'

export default function createActivatedRoute<C,D>(node: RouteStateTreeNode<C,D>, params: Params): ActivatedRoute<C,D> {
  return observable({
    node: node,
    key: node.value.key,
    params,
    context: node.value.getContext(),
    data: node.value.getData(),
    onTransition: node.value.onTransition
  })
}
