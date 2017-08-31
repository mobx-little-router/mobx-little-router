// @flow
import createRoute from './createRoute'
import RouterStateTree from './RouterStateTree'

describe('createRoute tree tests', () => {
  test('Finding path with simple matches', async () => {
    const tree = new RouterStateTree(
      createRoute({
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

  test('Finding path with param matching', async () => {
    const tree = new RouterStateTree(
      createRoute({
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

  test('Finding path with empty paths', async () => {
    const tree = new RouterStateTree(
      createRoute({
        path: '',
        data: { uid: '' },
        children: [
          {
            path: '',
            data: { uid: '' },
            children: [{ path: 'c' }]
          }
        ]
      })
    )

    const result = await tree.pathFromRoot('/c', () => Promise.resolve(true))

    expect(result.map(r => r.node.value.path)).toEqual(['', '', 'c'])
  })

  test('No match from path', async () => {
    const tree = new RouterStateTree(
      createRoute({
        path: 'a',
        children: [
          {
            path: '',
            children: [{ path: 'c' }]
          }
        ]
      })
    )

    const result = await tree.pathFromRoot('/a/d', () => Promise.resolve(true))

    expect(result.map(r => r.node.value.path)).toEqual(['a', ''])
  })

  test('Exhausting route nodes on search', async () => {
    const tree = new RouterStateTree(
      createRoute({
        path: 'a',
        children: [{ path: 'b', data: { uid: 'b' } }]
      })
    )

    const onExhausted = jest.fn(() => Promise.resolve())
    const result = await tree.pathFromRoot('/a/b/c', onExhausted)

    expect(result.map(r => r.node.value.path)).toEqual(['a', 'b'])
    expect(onExhausted).toHaveBeenCalledTimes(1)
  })

  test('find', () => {
    const tree = new RouterStateTree(
      createRoute({
        path: 'a',
        children: [
          {
            path: '',
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
