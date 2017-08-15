import type { IObservableArray } from 'mobx'
// @flow
import { extendObservable, observable } from 'mobx'

type ShouldContinue = boolean

export type OnExhaustedFn<T> = (node: TreeNode<T>) => Promise<ShouldContinue>

export class TreeNode<T> {
  value: T
  children: IObservableArray<TreeNode<T>>

  constructor(value: T, children: TreeNode<T>[]) {
    extendObservable(this, {
      value: value,
      children: observable.array(children)
    })
  }
}

type Predicate<T> = (n: TreeNode<T>, segment: string) => Promise<boolean>

// Asynchronous DFS from root node for a matching path based on return of visitor function.
export async function findPath<T>(
  predicate: Predicate<T>,
  onExhausted: OnExhaustedFn<T>,
  node: TreeNode<T>,
  path: string[]
): Promise<TreeNode<T>[]> {
  const [curr, ...rest] = path

  // No more segments to parse.
  if (curr === undefined) {
    return []
  }

  const result = await predicate(node, curr)

  if (result) {
    const isPathExhausted = rest.length > 0 && node.children.length === 0
    if (isPathExhausted) {
      // We've exhausted children, but still have unmatched parts.
      const shouldContinue = await onExhausted(node)
      if (!shouldContinue) {
        return [node]
      }
    }

    // Continue matching on each child recursively.
    // The children may have been mutated since the previous exhaustion check.
    for (const child of node.children) {
      const path = await findPath(predicate, onExhausted, child, rest)
      // Matched on child.
      if (path.length > 0) {
        path.unshift(node) // Add current node to beginning of matched path.
        return path
      }
    }

    // No child match, continue to next sibling.
    return [node]
  }

  // Nothing matched here.
  return []
}

// DFS for finding a matching node by predicate.
export function findNode<T>(
  predicate: (x: TreeNode<T>) => boolean,
  node: TreeNode<T>
): TreeNode<T> | null {
  if (predicate(node)) return node

  for (const child of node.children) {
    const node = findNode(predicate, child)
    if (node) return node
  }

  return null
}
