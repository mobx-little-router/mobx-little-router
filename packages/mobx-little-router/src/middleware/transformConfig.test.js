// @flow
import { EventTypes } from '../events'
import type { ChildrenConfigLoad } from '../events'
import transformConfig from './transformConfig'

describe('transformConfig middleware', () => {
  test('transforms config load event', () => {
    const f = () => ({ x: 1 })
    const g = transformConfig(config => {
      return {
        ...config,
        getData: f
      }
    })

    const c: ChildrenConfigLoad = {
      type: EventTypes.CHILDREN_CONFIG_LOAD,
      leaf: createLeaf(),
      navigation: createNavigation(),
      pathElements: [],
      module: [
        { path: 'b' },
        { path: 'c' }
      ]
    }

    expect(g.fold(c)).toEqual(expect.objectContaining({
      module: [
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