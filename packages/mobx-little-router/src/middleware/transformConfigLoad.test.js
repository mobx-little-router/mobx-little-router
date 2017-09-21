// @flow
import { EventTypes } from '../events'
import type { ChildrenConfigLoaded } from '../events'
import transformConfigLoad from './transformConfigLoad'

describe('transformConfigLoad middleware', () => {
  test('transforms config load event', () => {
    const f = () => ({ x: 1 })
    const g = transformConfigLoad(module => {
      return module.map(config => ({
        ...config,
        getData: f
      }))
    })

    const c: ChildrenConfigLoaded = {
      type: EventTypes.CHILDREN_CONFIG_LOADED,
      leaf: createLeaf(),
      navigation: createNavigation(),
      partialPath: [],
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

  test('handles null module', () => {
    const spy = jest.fn(x => x)
    const c: ChildrenConfigLoaded = {
      type: EventTypes.CHILDREN_CONFIG_LOADED,
      leaf: createLeaf(),
      navigation: createNavigation(),
      partialPath: [],
      module: null
    }

    expect(transformConfigLoad(spy).fold(c)).toEqual(expect.objectContaining({
      module: null
    }))
  })
})

function createNavigation(): any {
  return { type: 'PUSH', to: { pathname: 'b' } }
}

function createLeaf(): any {
  return { value: { path: 'a' } }
}