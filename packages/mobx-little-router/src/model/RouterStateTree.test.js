// @flow
import Route from './Route'
import RouterStateTree from './RouterStateTree'

describe('Route tree tests', () => {
  test('Finding path with simple matches', async () => {
    const tree = new RouterStateTree(
      Route({
        path: 'a',
        data: { uid: 'NODE_A' },
        children: [
          {
            path: 'b',
            data: { uid: 'NODE_B' },
            children: [{ path: 'c', data: { uid: 'NODE_C' } }]
          }
        ]
      })
    )

    const result = await tree.pathFromRoot('/a/b/c', () => Promise.resolve(true))

    expect(result.map(r => r.node.value.data.uid)).toEqual(['NODE_A', 'NODE_B', 'NODE_C'])
  })

  test('Finding path with param matching', async () => {
    const tree = new RouterStateTree(
      Route({
        path: 'a',
        data: { uid: 'NODE_A' },
        children: [
          {
            path: ':what',
            data: { uid: 'NODE_B' },
            children: [{ path: 'c', data: { uid: 'NODE_C' } }]
          }
        ]
      })
    )

    const result = await tree.pathFromRoot('/a/b/c', () => Promise.resolve(true))

    expect(result.map(r => r.node.value.data.uid)).toEqual(['NODE_A', 'NODE_B', 'NODE_C'])
  })

  test('Finding path with empty paths', async () => {
    const tree = new RouterStateTree(
      Route({
        path: '',
        data: { uid: 'NODE_ROOT' },
        children: [
          {
            path: '',
            data: { uid: 'NODE_EMPTY' },
            children: [{ path: 'c', data: { uid: 'NODE_C' } }]
          }
        ]
      })
    )

    const result = await tree.pathFromRoot('/c', () => Promise.resolve(true))

    expect(result.map(r => r.node.value.data.uid)).toEqual([
      'NODE_ROOT',
      'NODE_EMPTY',
      'NODE_C'
    ])
  })

  test('No match from path', async () => {
    const tree = new RouterStateTree(
      Route({
        path: 'a',
        data: { uid: 'NODE_A' },
        children: [
          {
            path: '',
            data: { uid: 'NODE_EMPTY' },
            children: [{ path: 'c', data: { uid: 'NODE_C' } }]
          }
        ]
      })
    )

    const result = await tree.pathFromRoot('/a/d', () => Promise.resolve(true))

    expect(result.map(r => r.node.value.data.uid)).toEqual(['NODE_A', 'NODE_EMPTY'])
  })

  test('Exhausting route nodes on search', async () => {
    const tree = new RouterStateTree(
      Route({
        path: 'a',
        data: { uid: 'NODE_A' },
        children: [{ path: 'b', data: { uid: 'NODE_B' } }]
      })
    )

    const onExhausted = jest.fn(() => Promise.resolve())
    const result = await tree.pathFromRoot('/a/b/c', onExhausted)

    expect(result.map(r => r.node.value.data.uid)).toEqual(['NODE_A', 'NODE_B'])
    expect(onExhausted).toHaveBeenCalledTimes(1)
  })

  test('find', () => {
    const tree = new RouterStateTree(
      Route({
        path: 'a',
        data: { uid: 'NODE_A' },
        children: [
          {
            path: '',
            data: { uid: 'NODE_EMPTY' },
            children: [{ path: 'c', data: { uid: 'NODE_C' } }]
          }
        ]
      })
    )
    expect(tree.find(x => x.value.data.uid === 'NOPE')).toBe(null)
    expect(tree.find(x => x.value.data.uid === 'NODE_C')).not.toBe(null)
  })
})
