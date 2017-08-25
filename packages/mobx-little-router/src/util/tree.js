// @flow
import type { IObservableArray } from 'mobx'
import { extendObservable, observable } from 'mobx'

type ShouldContinue = boolean

export type onLeafReached<T> = (node: ITreeNode<T>) => Promise<ShouldContinue>

export type ITreeNode<T> = {
  value: T,
  children: IObservableArray<ITreeNode<T>>
}

export function TreeNode<T>(value: T, children: ITreeNode<T>[]): ITreeNode<T> {
  return extendObservable({}, {
    value: value,
    children: observable.array(children)
  })
}

export type Matcher<T> = (n: ITreeNode<T>) => Promise<boolean>

// Asynchronous DFS from root node for a matching path based on return of visitor function.
export async function findPath<T>(
  match: Matcher<T>,
  node: ITreeNode<T>,
  onLeafReached: onLeafReached<T>
): Promise<ITreeNode<T>[]> {
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
  predicate: (x: ITreeNode<T>) => boolean,
  node: ITreeNode<T>
): ITreeNode<T> | null {
  if (predicate(node)) return node

  for (const child of node.children) {
    const node = findNode(predicate, child)
    if (node) return node
  }

  return null
}
