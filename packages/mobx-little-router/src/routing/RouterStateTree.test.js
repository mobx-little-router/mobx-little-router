// @flow
import createRouteNode from './createRouteNode'
import RouterStateTree from './RouterStateTree'

describe('Route tree tests', () => {
  let tree

  beforeEach(() => {
    tree = new RouterStateTree(
      createRouteNode({
        path: '',
        data: {
          uid: 'ROOT'
        },
        children: [
          {
            path: ':username',
            data: {
              uid: 'ACCOUNT_ROOT'
            },
            children: [
              {
                path: ':slug',
                data: { uid: 'HUB_ROOT' },
                children: [
                  { path: '', data: { uid: 'HUB_STREAM' } },
                  { path: 'spotlight/:slug', data: { uid: 'HUB_SPOTLIGHT' } }
                ]
              }
            ]
          }
        ]
      })
    )
  })

  test('traversal', async () => {
    const result = await tree.pathFromRoot(['', 'pressly', 'news', ''], () => Promise.resolve(true))

    expect(result.map(r => r.node.value.data.uid)).toEqual([
      'ROOT',
      'ACCOUNT_ROOT',
      'HUB_ROOT',
      'HUB_STREAM'
    ])

    expect(result.map(r => r.node.value.path)).toEqual(['', ':username', ':slug', ''])

    expect(result.map(r => r.segment)).toEqual(['', 'pressly', 'news', ''])

    expect(result.map(r => r.params)).toEqual([
      {},
      { username: 'pressly' },
      { slug: 'news' },
      {}
    ])
  })

  test('find', () => {
    expect(tree.find(x => x.value.data.uid === 'NOPE')).toBe(null)
    expect(tree.find(x => x.value.data.uid === 'HUB_SPOTLIGHT')).not.toBe(null)
  })
})
