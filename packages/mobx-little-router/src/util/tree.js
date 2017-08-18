// @flow
import type { IObservableArray } from 'mobx'
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

  toString() {
    return JSON.stringify(this.value, null, 2)
  }
}

export type Matcher<T> = (n: TreeNode<T>, segments: string[]) => Promise<MatchResult>

export type MatchResult = {
  consumedSegments: string[],
  lastSegmentIndex: number
}

// Asynchronous DFS from root node for a matching path based on return of visitor function.
export async function findPath<T>(
  match: Matcher<T>,
  onExhausted: OnExhaustedFn<T>,
  node: TreeNode<T>,
  segments: string[]
): Promise<TreeNode<T>[]> {
  // No more segments to parse.
  if (segments.length === 0) {
    return []
  }

  const { consumedSegments, lastSegmentIndex } = await match(node, segments)
  const newSegments = segments.slice(lastSegmentIndex)


  if (consumedSegments.length > 0) {
    const isPathExhausted = newSegments.length > 0 && node.children.length === 0
    if (isPathExhausted) {
      const shouldContinue = await onExhausted(node)
      if (!shouldContinue) {
        return [node]
      }
    }

    for (const child of node.children) {
      const childPath = await findPath(match, onExhausted, child, newSegments)
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
