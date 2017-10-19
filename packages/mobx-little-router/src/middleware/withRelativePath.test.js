// @flow
import { EventTypes } from '../events/index'
import Navigation from '../model/Navigation'
import type { NavigationStart } from '../events/index'
import withRelativePath from './withRelativePath'
import RouterStore from '../model/RouterStore'
import createRouteStateTreeNode from '../model/createRouteStateTreeNode'

describe('withRelativePath middleware', () => {
  test('transforms pathname', () => {
    const store = new RouterStore(createRouteStateTreeNode({ path: '' }))
    store.location = ({ pathname: '/foo/bar/' }: any)
    const c: NavigationStart = {
      type: EventTypes.NAVIGATION_START,
      navigation: new Navigation({
        type: 'PUSH',
        to: {
          pathname: '../../a'
        }
      })
    }

    expect(withRelativePath.fold(c, store)).toEqual(
      expect.objectContaining({
        navigation: expect.objectContaining({
          to: {
            pathname: '/a/'
          }
        })
      })
    )
  })
})
