// @flow
import findPathFromRoot from './findPathFromRoot'
import createRoute from '../createRoute'

describe('findPathFromRoot', () => {
  test('Find with partial matching', async () => {
    const root = createRoute({
      path: 'a',
      children: [
        { path: 'b', children: [] },
        {
          path: 'c',
          children: [{ path: 'd', children: [] }]
        }
      ]
    })

    const r1 = await findPathFromRoot(root, '/a/b', () => Promise.resolve(true))
    expect(r1.map(x => x.node.value.path)).toEqual(['a', 'b'])

    const r2 = await findPathFromRoot(root, '/a/c/d', () => Promise.resolve(true))
    expect(r2.map(x => x.node.value.path)).toEqual(['a', 'c', 'd'])
  })

  test('Find with mix of partial and full matching', async () => {
    const root = createRoute(
      config('', 'partial', [
        // This match consumes the entire URL.
        // Useful for index routes.
        config('', 'full', []),

        config('a', 'partial', [
          config('b', 'partial', [
            config('c', 'partial', [config('', 'full', [config('', 'full', [])])])
          ])
        ])
      ])
    )

    const r1 = await findPathFromRoot(root, '/a/b/c', () => Promise.resolve(true))
    expect(r1.map(x => x.node.value.path)).toEqual(['', 'a', 'b', 'c', ''])

    const r2 = await findPathFromRoot(root, '/', () => Promise.resolve(true))
    expect(r2.map(x => x.node.value.path)).toEqual(['', ''])
  })
})

function config(path, match, children) {
  return { path, match, children }
}
