// @flow
import { TreeNode, findPath, findNode } from './tree'

describe('Tree tests', () => {
  test('findPath with matched and unmatched segments', async () => {
    const shouldContinue = jest.fn(() => Promise.resolve(true))
    const root = new TreeNode({ x: 'a' }, [
      new TreeNode({ x: 'b' }, []),
      new TreeNode({ x: 'c' }, [
        new TreeNode({ x: 'd' }, []),
        new TreeNode({ x: 'e' }, [])
      ])
    ])
    const eq = (node: TreeNode<*>, segments: string[]) => {
      const matchOnFirst = node.value.x === segments[0]
      return Promise.resolve({
        consumedSegments: matchOnFirst ? [segments[0]] : [],
        lastSegmentIndex: matchOnFirst ? 1 : 0
      })
    }

    const r1 = await findPath(eq, shouldContinue, root, ['a', 'c'])
    expect(r1.map(n => n.value.x)).toEqual(['a', 'c'])

    const r2 = await findPath(eq, shouldContinue, root, ['a', 'c', 'd'])
    expect(r2.map(n => n.value.x)).toEqual(['a', 'c', 'd'])

    // Another search but with segments that will not match
    const r3 = await findPath(eq, shouldContinue, root, [
      'a',
      'c',
      'd',
      'this',
      'will',
      'not',
      'match'
    ])
    expect(r3.map(n => n.value.x)).toEqual(['a', 'c', 'd'])

    // Did not match remaining paths, so it `shouldContinue` must be called.
    expect(shouldContinue).toHaveBeenCalledTimes(1)
    expect(shouldContinue.mock.calls[0][0].value.x).toEqual('d') // Last matched node is passed as argument.
  })

  test('findNode', () => {
    const root = new TreeNode({ x: 1 }, [
      new TreeNode({ x: 2 }, []),
      new TreeNode({ x: 3 }, [new TreeNode({ x: 4 }, [])])
    ])

    const found = findNode(node => node.value.x === 3, root)
    expect(found).toBe(root.children[1])
  })
})
