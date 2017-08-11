// @flow
import createRouteTree from './createRouteTree'

describe('Route tree tests', () => {
  test('traversal', async () => {
    const tree = createRouteTree({
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

    const result = await tree.pathFromRoot(['', 'pressly', 'news', ''])

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
})
