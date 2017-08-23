// @flow
import type { ITreeNode } from './tree'
import { createTreeNode, findPath, findNode } from './tree'

describe('Tree tests', () => {
  test('findPath with matched and unmatched segments', async () => {
    const onLeafReached = jest.fn(() => Promise.resolve(true))
    const root = createTreeNode({ x: 'a', y: 5 }, [
      createTreeNode({ x: 'b', y: 1 }, []),
      createTreeNode({ x: 'a', y: 6 }, [
        createTreeNode({ x: 'a', y: 2 }, []),
        createTreeNode({ x: 'b', y: 3 }, []),
        createTreeNode({ x: 'c', y: 4 }, []),
        createTreeNode({ x: 'd', y: 7 }, [])
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
    const root = createTreeNode({ x: 1 }, [
      createTreeNode({ x: 2 }, []),
      createTreeNode({ x: 3 }, [createTreeNode({ x: 4 }, [])])
    ])

    const found = findNode(node => node.value.x === 3, root)
    expect(found).toBe(root.children[1])
  })
})
