// @flow
import { TreeNode, findPath, findNode } from './tree'

describe('Tree tests', () => {
  test('findPath with matched and unmatched segments', async () => {
    const shouldContinue = jest.fn(() => Promise.resolve(true))
    const root = new TreeNode({ x: 'foo' }, [
      new TreeNode({ x: '???' }, []),
      new TreeNode({ x: 'bar' }, [new TreeNode({ x: 'quux' }, []), new TreeNode({ x: 'faz' }, [])])
    ])
    const eq = (n: TreeNode<*>, x) => Promise.resolve(n.value.x === x)

    // DFS for nodes with x > 5
    const r1 = await findPath(
      eq,
      shouldContinue,
      root,
      ['foo', 'bar']
    )

    expect(r1.map(n => n.value.x)).toEqual(['foo', 'bar'])

    // Another search but with depth 3.
    const r2 = await findPath(
      eq,
      shouldContinue,
      root,
      ['foo', 'bar', 'quux']
    )

    expect(r2.map(n => n.value.x)).toEqual(['foo', 'bar', 'quux'])

    // Another search but with segments that will not match
    const r3 = await findPath(
      eq,
      shouldContinue,
      root,
      ['foo', 'bar', 'quux', 'this', 'will', 'not', 'match']
    )

    expect(r3.map(n => n.value.x)).toEqual(['foo', 'bar', 'quux'])

    // Did not match remaining paths, so it `shouldContinue` must be called.
    expect(shouldContinue).toHaveBeenCalledTimes(1)
    expect(shouldContinue.mock.calls[0][0].value.x).toEqual('quux') // Last matched node is passed as argument.
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
