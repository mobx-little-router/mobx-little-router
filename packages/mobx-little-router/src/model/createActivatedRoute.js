// @flow
import { observable } from 'mobx'
import type { Params, ActivatedRoute, RouteNode } from './types'

export default function createActivatedRoute<C,D>(node: RouteNode<C,D>, params: Params): ActivatedRoute<C,D> {
  return observable({
    node: node,
    key: node.value.key,
    params,
    context: node.value.getContext(),
    data: node.value.getData(),
    onTransition: node.value.onTransition
  })
}
