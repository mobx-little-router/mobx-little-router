// @flow
import createRouteStateTreeNode from './createRouteStateTreeNode'
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

      const result = await tree.pathFromRoot('/a/b/c', () => Promise.resolve(true))

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

      const result = await tree.pathFromRoot('/a/b/c', () => Promise.resolve(true))

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

      const result = await tree.pathFromRoot('/c', () => Promise.resolve(true))

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

      let result = await tree.pathFromRoot('/c', () => Promise.resolve(true))
      expect(result.map(r => r.node.value.path)).toEqual(['', '**'])

      // Bubbles back up.
      result = await tree.pathFromRoot('/a/404', () => Promise.resolve(true))
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

      const result = await tree.pathFromRoot('/a/d', () => Promise.resolve(true))

      expect(result.map(r => r.node.value.path)).toEqual(['a', ''])
    })

    test('exhausting route nodes on search', async () => {
      const tree = new RouterStateTree(
        createRouteStateTreeNode({
          path: 'a',
          children: [{
            match: 'partial',
            path: 'b', data: { uid: 'b' }
          }]
        })
      )

      const onExhausted = jest.fn(() => Promise.resolve())
      const result = await tree.pathFromRoot('/a/b/c', onExhausted)

      expect(result.map(r => r.node.value.path)).toEqual(['a', 'b'])
      expect(onExhausted).toHaveBeenCalledTimes(1)
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
