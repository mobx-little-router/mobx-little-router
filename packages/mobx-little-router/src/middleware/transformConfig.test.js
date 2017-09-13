// @flow
import { EventTypes } from '../events'
import type { ChildrenLoad } from '../events'
import transformConfig from './transformConfig'

describe('transformConfig middleware', () => {
  test('transforms config before passing them as children', () => {
    const f = () => ({ x: 1 })
    const g = transformConfig(config => {
      return {
        ...config,
        getData: f
      }
    })

    const c: ChildrenLoad = {
      type: EventTypes.CHILDREN_LOAD,
      leaf: createLeaf(),
      navigation: createNavigation(),
      pathElements: [],
      children: [
        { path: 'b' },
        { path: 'c' }
      ]
    }

    expect(g.fold(c)).toEqual(expect.objectContaining({
      children: [
        { path: 'b', getData: f },
        { path: 'c', getData: f }
        ]
    }))
  })
})

function createNavigation(): any {
  return { type: 'PUSH', to: { pathname: 'b' } }
}

function createLeaf(): any {
  return { value: { path: 'a' } }
}