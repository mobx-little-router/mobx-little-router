// @flow
import type { IObservableArray } from 'mobx'
import { extendObservable, observable } from 'mobx'

type ShouldContinue = boolean

export type onLeafReached<T> = (node: TreeNode<T>) => Promise<ShouldContinue>

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

export type Matcher<T> = (n: TreeNode<T>) => Promise<boolean>


// Asynchronous DFS from root node for a matching path based on return of visitor function.
export async function findPath<T>(
  match: Matcher<T>,
  node: TreeNode<T>,
  onLeafReached: onLeafReached<T>
): Promise<TreeNode<T>[]> {
  const matched = await match(node)
  if (matched) {
    const isPathExhausted = matched && node.children.length === 0
    if (isPathExhausted) {
      const shouldContinue = await onLeafReached(node)
      if (!shouldContinue) {
        return [node]
      }
    }

    for (const child of node.children) {
      const childPath = await findPath(match, child, onLeafReached)
      if (childPath.length > 0) {
        childPath.unshift(node)
        return childPath
      }
    }

    return [node]
  }

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
