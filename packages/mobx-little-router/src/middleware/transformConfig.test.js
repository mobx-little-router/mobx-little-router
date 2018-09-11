// @flow
import { EventTypes } from '../events'
import type { ChildrenLoading } from '../events'
import transformConfig from './transformConfig'
import createRouteStateTreeNode from '../model/creating/createRouteStateTreeNode'

describe('transformConfig middleware', () => {
  test('transforms config before passing them as children', () => {
    const f = () => ({ x: 1 })
    const g = transformConfig(config => {
      return {
        ...config,
        getData: f
      }
    })

    const c: ChildrenLoading = {
      type: EventTypes.CHILDREN_LOADING,
      root: createRouteStateTreeNode({
        path: ''
      }),
      leaf: createLeaf(),
      navigation: createNavigation(),
      partialPath: [],
      children: [
        { path: 'b' },
        { path: 'c', children: [{ path: 'd', children: [{ path: 'e' }] }] }
      ]
    }

    expect(g.fold(c)).toEqual(
      expect.objectContaining({
        children: [
          { path: 'b', getData: f },
          {
            path: 'c',
            getData: f,
            children: [{ path: 'd', getData: f, children: [{ path: 'e', getData: f }] }]
          }
        ]
      })
    )
  })
})

function createNavigation(): any {
  return { type: 'PUSH', to: { pathname: 'b' } }
}

function createLeaf(): any {
  return { value: { path: 'a' } }
}
