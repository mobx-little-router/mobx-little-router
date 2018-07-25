// @flow
import { EventTypes } from 'mobx-little-router'
import transformReactConfig from './transformReactConfig'

describe('transformReactConfig middleware', () => {
  test('transforms config before passing them as children', () => {
    const B = () => {}
    const C = () => {}
    const D = () => {}

    const c = {
      type: EventTypes.CHILDREN_LOADING,
      leaf: createLeaf(),
      navigation: createNavigation(),
      partialPath: null,
      children: [
        { path: 'b', component: B, outlet: 'modal' },
        { path: 'c', component: C, children: [{ path: 'd', component: D }] }
      ]
    }

    const transformed = transformReactConfig.fold(c)

    expect(transformed.children[0].getData().component).toBe(B)
    expect(transformed.children[0].getData().outlet).toBe('modal')
    expect(transformed.children[1].getData().component).toBe(C)
    expect(transformed.children[1].children[0].getData().component).toBe(D)
  })
})

function createNavigation(): any {
  return { type: 'PUSH', to: { pathname: 'b' } }
}

function createLeaf(): any {
  return { value: { path: 'a' } }
}
