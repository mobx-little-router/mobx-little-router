// @flow
import { createMemoryHistory } from 'history'
import Middleware from './middleware/Middleware'
import { EventTypes } from './events'
import Navigation from './model/Navigation'
import Router from './Router'
import delay from './util/delay'

describe('Router', () => {
  let router: any

  beforeEach(() => {
    router = new Router(
      createMemoryHistory(),
      [
        { path: '', match: 'full' },
        {
          path: 'a',
          children: [
            {
              path: 'a2',
              children: [
                {
                  path: 'a3',
                  children: [
                    {
                      path: 'a4'
                    }
                  ]
                }
              ]
            }
          ]
        },
        { path: 'b' },
        { path: 'c' }
      ],
      () => ({ message: 'Hello' }),
      Middleware.EMPTY
    )

    return router.start()
  })

  afterEach(() => {
    router.stop()
  })

  describe('events', () => {
    test('handling transition events', async () => {
      router._scheduler.dispatch(
        abortNavigation('PUSH', { pathname: '/' }, { pathname: '/a' })
      )
      await delay(0)
      await delay(0)

      expect(router.location.pathname).toEqual('/a/')

      router._scheduler.dispatch(abortNavigation('GO_BACK', { pathname: '/' }, null))
      await delay(0)
      await delay(0)

      expect(router.location.pathname).toEqual('/')

      router._scheduler.dispatch(
        abortNavigation('REPLACE', { pathname: '/' }, { pathname: '/b' })
      )
      await delay(0)
      await delay(0)

      expect(router.location.pathname).toEqual('/b/')
    })
  })

  test('stringify query into query', async () => {
    await router.push({ pathname: '/a', query: { b: '2', c: '3' } })
    expect(router.location.search).toEqual('?b=2&c=3')

    await router.push({ pathname: '/a', query: {} })
    expect(router.location.search).toEqual('')

    await router.push(({ pathname: '/a', query: null }: any)) // In case of dynamic `any` being pushed.
    expect(router.location.search).toEqual('')
  })

  test('updateQuery', async () => {
    await router.updateQuery({ x: '1' })
    expect(router.location.search).toEqual('?x=1')

    await router.updateQuery({ y: '2' }, { merge: true })
    expect(router.location.search).toEqual('?x=1&y=2')

    await router.updateQuery({ y: '3' }, { merge: true })
    expect(router.location.search).toEqual('?x=1&y=3')

    await router.updateQuery({ y: '4', z: '5' })
    expect(router.location.search).toEqual('?y=4&z=5')

    await router.updateQuery({ y: '4', z: undefined }, { merge: true })
    expect(router.location.search).toEqual('?y=4')

    await router.updateQuery({})
    expect(router.location.search).toEqual('')
  })

  test('relativePath', async () => {
    await router.push('/a/a2/a3/a4/')

    expect(router.relativePath('/a')).toBe('/a/')
    expect(router.relativePath('/a/')).toBe('/a/')
    expect(router.relativePath('/a/../b')).toBe('/b/')
    expect(router.relativePath('/a/./b')).toBe('/a/b/')

    expect(router.relativePath('a5')).toBe('/a/a2/a3/a4/a5/')

    expect(router.relativePath('../')).toBe('/a/a2/a3/')
    expect(router.relativePath('../b4')).toBe('/a/a2/a3/b4/')
    expect(router.relativePath('../../b3')).toBe('/a/a2/b3/')
    expect(router.relativePath('../../../b2')).toBe('/a/b2/')
    expect(router.relativePath('../../../../b')).toBe('/b/')

    expect(router.relativePath('./')).toBe('/a/a2/a3/a4/')
    expect(router.relativePath('./b5')).toBe('/a/a2/a3/a4/b5/')
    expect(router.relativePath('./b5/b6')).toBe('/a/a2/a3/a4/b5/b6/')
    expect(router.relativePath('./b5/../c5')).toBe('/a/a2/a3/a4/c5/')

    // Can't go past the root
    expect(router.relativePath('../../../../../../../../../b')).toBe('/b/') 
  })
})

function abortNavigation(navigationType: *, from: *, to: *) {
  return {
    type: EventTypes.NAVIGATION_CANCELLED,
    nextNavigation: new Navigation({
      type: navigationType,
      from,
      to
    })
  }
}
