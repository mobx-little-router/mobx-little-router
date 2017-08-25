// @flow
import type { ITreeNode } from './tree'
import { TreeNode, findPath, findNode } from './tree'

describe('Tree tests', () => {
  test('findPath with matched and unmatched segments', async () => {
    const onLeafReached = jest.fn(() => Promise.resolve(true))
    const root = TreeNode({ x: 'a', y: 5 }, [
      TreeNode({ x: 'b', y: 1 }, []),
      TreeNode({ x: 'a', y: 6 }, [
        TreeNode({ x: 'a', y: 2 }, []),
        TreeNode({ x: 'b', y: 3 }, []),
        TreeNode({ x: 'c', y: 4 }, []),
        TreeNode({ x: 'd', y: 7 }, [])
      ])
    ])
    const eq = x => (node: ITreeNode<*>) => Promise.resolve(node.value.x === x)
    const gte = y => (node: ITreeNode<*>) => Promise.resolve(node.value.y >= y)

    const r1 = await findPath(eq('a'), root, onLeafReached)
    expect(r1.map(n => n.value.x)).toEqual(['a', 'a', 'a'])

    const r2 = await findPath(gte(5), root, onLeafReached)
    expect(r2.map(n => n.value.y)).toEqual([5, 6, 7])

    expect(onLeafReached).toHaveBeenCalledTimes(2)
    expect(onLeafReached.mock.calls[0].map(n => n.value.x)).toEqual(['a']) // Last matched node is passed as argument.
    expect(onLeafReached.mock.calls[1].map(n => n.value.y)).toEqual([7]) // Last matched node is passed as argument.
  })

  test('findNode', () => {
    const root = TreeNode({ x: 1 }, [
      TreeNode({ x: 2 }, []),
      TreeNode({ x: 3 }, [TreeNode({ x: 4 }, [])])
    ])

    const found = findNode(node => node.value.x === 3, root)
    expect(found).toBe(root.children[1])
  })
})
