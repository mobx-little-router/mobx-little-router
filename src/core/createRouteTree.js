// @flow
import RouteStateTree from './RouteStateTree'
import type { RouteValue }  from './RouteStateTree'
import { TreeNode } from '../util/tree'
import UrlPattern from 'url-pattern'

type Config = {
  path: string,
  data?: Object,
  children?: Config[]
}

export function createRouteNode(config: Config): TreeNode<RouteValue> {
  return new TreeNode({
    path: config.path,
    pattern: config.path !== '' ? new UrlPattern(config.path) : null,
    data: config.data || {},
    params: null
  }, config.children ? config.children.map(createRouteNode) : [] )
}

export default function createTree(config: Config) {
  return new RouteStateTree(createRouteNode(config))
}
