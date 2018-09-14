// @flow
import createRouteStateTreeNode from '../../model/creating/createRouteStateTreeNode'
import createIncomingRoutes from './createIncomingRoutes'
import type { PathElement } from '../../model/types'

describe('createIncomingRoutes', () => {
  test('Building routes from path', () => {
    const dataSpy = jest.fn(() => Promise.resolve())
    const a = createRouteStateTreeNode({ path: 'a', getData: () => dataSpy('a') })
    const b = createRouteStateTreeNode({ path: 'b', getData: () => dataSpy('b') })
    const c = createRouteStateTreeNode({ path: 'c', getData: () => dataSpy('c') })

    const nextPath1: PathElement<*, *>[] = [
      { node: a, params: { x: '1' }, parentUrl: '', segment: '/a/1', remaining: '/b/1/c/1' },
      { node: b, params: { y: '1' }, parentUrl: '/a/1', segment: '/b/1', remaining: '/c/1' },
      { node: c, params: { z: '1' }, parentUrl: '/a/1/b/1', segment: '/c/1', remaining: '' }
    ]

    const routes = createIncomingRoutes({}, nextPath1, ({}: any))

    expect(routes).toEqual([
      expect.objectContaining({ params: { x: '1' } }),
      expect.objectContaining({ params: { y: '1' } }),
      expect.objectContaining({ params: { z: '1' } })
    ])
  })
})
