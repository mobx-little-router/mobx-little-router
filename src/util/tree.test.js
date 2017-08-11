// @flow
import { TreeNode, findPath } from './tree'

describe('Tree tests', () => {
  test('traversal', async () => {
    const root = new TreeNode(
      {
        x: 10
      },
      [
        new TreeNode(
          {
            x: 5
          },
          []
        ),
        new TreeNode(
          {
            x: 9
          },
          [
            new TreeNode(
              {
                x: 7
              },
              []
            ),
            new TreeNode(
              {
                x: 4
              },
              []
            )
          ]
        )
      ]
    )

    // DFS for nodes with x > 5
    const r1 = await findPath(n => {
      return Promise.resolve(n.value.x > 5)
    }, root, ['foo', 'bar']) // The path here doesn't matter except for limiting the depth.

    expect(r1.map(n => n.value.x)).toEqual([10, 9])

    // Another search but with depth 3.
    const r2 = await findPath(n => {
      return Promise.resolve(n.value.x > 5)
    }, root, ['foo', 'bar', 'quux']) // The path here doesn't matter except for limiting the depth.

    expect(r2.map(n => n.value.x)).toEqual([10, 9, 7])

    // Another search but with segments that will not match
    const r3 = await findPath(n => {
      return Promise.resolve(n.value.x > 5)
    }, root, ['foo', 'bar', 'quux', 'this', 'will', 'not', 'match']) // The path here doesn't matter except for limiting the depth.

    expect(r3.map(n => n.value.x)).toEqual([10, 9, 7])
  })
})
