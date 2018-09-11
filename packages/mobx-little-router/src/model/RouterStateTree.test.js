// @flow
import createRouteStateTreeNode from './creating/createRouteStateTreeNode'
import RouterStateTree from './RouterStateTree'

describe('createRouteStateTreeNode tests', () => {
  describe('pathFromRoot', () => {
    test('path with simple matches', async () => {
      const tree = new RouterStateTree(
        createRouteStateTreeNode({
          path: 'a',
          children: [
            {
              path: 'b',
              children: [{ path: 'c' }]
            }
          ]
        })
      )

      const result = await tree.pathFromRoot('/a/b/c')

      expect(result.map(r => r.node.value.path)).toEqual(['a', 'b', 'c'])
    })

    test('path with param matching', async () => {
      const tree = new RouterStateTree(
        createRouteStateTreeNode({
          path: 'a',
          children: [
            {
              path: ':what',
              children: [{ path: 'c' }]
            }
          ]
        })
      )

      const result = await tree.pathFromRoot('/a/b/c')

      expect(result.map(r => r.node.value.path)).toEqual(['a', ':what', 'c'])
    })

    test('path with empty paths', async () => {
      const tree = new RouterStateTree(
        createRouteStateTreeNode({
          path: '',
          match: 'partial',
          data: { uid: '' },
          children: [
            {
              path: '',
              match: 'partial',
              data: { uid: '' },
              children: [{ path: 'c' }]
            }
          ]
        })
      )

      const result = await tree.pathFromRoot('/c')

      expect(result.map(r => r.node.value.path)).toEqual(['', '', 'c'])
    })

    test('catch-all paths (**)', async () => {
      const tree = new RouterStateTree(
        createRouteStateTreeNode({
          path: '',
          match: 'partial',
          data: { uid: '' },
          children: [{ path: 'a' }, { path: 'b' }, { path: '**' }]
        })
      )

      let result = await tree.pathFromRoot('/c')
      expect(result.map(r => r.node.value.path)).toEqual(['', '**'])

      // Bubbles back up.
      result = await tree.pathFromRoot('/a/404')
      expect(result.map(r => r.node.value.path)).toEqual(['', '**'])
    })

    test('no match from path', async () => {
      const tree = new RouterStateTree(
        createRouteStateTreeNode({
          path: 'a',
          children: [
            {
              path: '',
              match: 'partial',
              children: [{ path: 'c' }]
            }
          ]
        })
      )

      const result = await tree.pathFromRoot('/a/d')

      expect(result.map(r => r.node.value.path)).toEqual(['a', ''])
    })
  })

  test('find', () => {
    const tree = new RouterStateTree(
      createRouteStateTreeNode({
        path: 'a',
        children: [
          {
            path: '',
            match: 'partial',
            data: { uid: '' },
            children: [{ path: 'c' }]
          }
        ]
      })
    )
    expect(tree.find(x => x.value.path === 'NOPE')).toBe(null)
    expect(tree.find(x => x.value.path === 'c')).not.toBe(null)
  })
})
