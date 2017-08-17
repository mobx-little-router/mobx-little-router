// @flow
import createRouteNode from './createRouteNode'
import RouterStateTree from './RouterStateTree'

describe('Route tree tests', () => {
  let tree

  beforeEach(() => {
    tree = new RouterStateTree(
      createRouteNode({
        path: '',
        data: { uid: 'TREE_ROOT' },
        children: [
          {
            path: '',
            data: { uid: 'APP_ROOT' },
            children: [
              {
                path: '',
                data: { uid: 'HOME' }
              },
              {
                path: ':username',
                data: { uid: 'ACCOUNT_ROOT' },
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
          }
        ]
      })
    )
  })

  test.only('traversal', async () => {
    const r1 = await tree.pathFromRoot(['', 'pressly', 'news', ''], () => {
      return Promise.resolve(true)
    })

    expect(r1.map(r => r.node.value.data.uid)).toEqual([
      'TREE_ROOT',
      'APP_ROOT',
      'ACCOUNT_ROOT',
      'HUB_ROOT',
      'HUB_STREAM'
    ])
    expect(r1.map(r => r.node.value.path)).toEqual(['', 'app', ':username', ':slug', ''])
    expect(r1.map(r => r.params)).toEqual([
      {},
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
