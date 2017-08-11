// @flow
import UrlPattern from 'url-pattern'
import { TreeNode, findPath } from '../util/tree'

export type RouteValue = {
  // Original path provided to this route node.
  path: string,
  // Pattern to match segments with.
  pattern: null | UrlPattern,
  // Matched path parameters.
  params: null | Object,
  // Extra data that can be used to provide view specific functionality.
  // e.g. Route component, loading component, etc.
  data: Object
}

export type MatchResult = {
  node: TreeNode<RouteValue>,
  segment: string,
  params: Object
}

export default class RouteStateTree {
  root: TreeNode<RouteValue>

  constructor(root: TreeNode<RouteValue>) {
    this.root = root
  }

  async pathFromRoot(path: string[]): Promise<MatchResult[]> {
    const matched: MatchResult[] = []
    await findPath(
      (node: TreeNode<RouteValue>, segment) => {
        const { value: { pattern, path } } = node

        // Try to match pattern if it exists.
        if (pattern !== null) {
          const params = pattern.match(segment)
          if (params !== null) {
            matched.push({ node, segment, params })
            return Promise.resolve(true)
          }
          // If pattern does not existing, we need to match on empty string (index route).
        } else if (path === segment) {
          matched.push({ node, segment, params: {} })
          return Promise.resolve(true)
        }

        // No match.
        return Promise.resolve(false)
      },
      this.root,
      path
    )

    return matched
  }
}
