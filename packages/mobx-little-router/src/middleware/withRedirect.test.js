// @flow
import withRedirect from './withRedirect'
import createRouteStateTreeNode from '../model/createRouteStateTreeNode'
import Navigation from '../model/Navigation'
import createRoute from '../model/createRoute'
import { EventTypes } from '../events/index'

describe('withRedirect', () => {
  test('Handles redirect config', async () => {
    const result = withRedirect.fold({
      type: EventTypes.CHILDREN_LOADING,
      partialPath: [],
      children: [
        { path: 'a/:id', redirectTo: '/b/:id' },
        {
          path: 'c',
          children: [
            { path: '', redirectTo: 'd' },
            {
              path: 'e',
              children: [{ path: 'f', redirectTo: 'g' }]
            },
            { path: 'h', redirectTo: 'i' }
          ]
        }
      ]
    })

    await assertRedirect(
      result.children[0],
      { pathname: '/a/123', parentUrl: '', segment: '/a/123', params: { id: '123' } },
      { pathname: '/b/123', params: { id: '123' } }
    )

    await assertRedirect(
      result.children[1].children[0],
      { pathname: '/c', parentUrl: '/c', segment: '', params: {} },
      { pathname: '/c/d', params: {} }
    )

    await assertRedirect(
      result.children[1].children[1].children[0],
      { pathname: '/c/e/f', parentUrl: '/c/e', segment: '/f', params: {} },
      { pathname: '/c/e/g', params: {} }
    )

    await assertRedirect(
      result.children[1].children[2],
      { pathname: '/c/h', parentUrl: '/c', segment: '/h', params: {} },
      { pathname: '/c/i', params: {} }
    )
  })
})

async function assertRedirect(config, from, to) {
  await expect(
    config.willActivate(
      createRoute(createRouteStateTreeNode(config), from.parentUrl, from.segment, from.params, {}),
      new Navigation({
        type: 'PUSH',
        to: { pathname: from.pathname }
      })
    )
  ).rejects.toEqual(
    expect.objectContaining({
      from: expect.objectContaining({ pathname: from.pathname }),
      to: expect.objectContaining({ pathname: to.pathname })
    })
  )
}
