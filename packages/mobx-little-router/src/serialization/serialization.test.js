// @flow
import { autorun, flow, when } from 'mobx'
import { createMemoryHistory } from 'history'
import { serialize } from './index'
import install from '../install'

describe('serialization', () => {
  let router

  beforeEach(() => {
    router = install({
      history: createMemoryHistory(),
      routes: [
        {
          key: 'a',
          path: '/a'
        },
        {
          key: 'b',
          path: '/b'
        },
        {
          key: 'c',
          path: '/c',
          loadChildren: () =>
            Promise.resolve([
              {
                key: 'd',
                path: '/d',
                query: ['q'],
                loadChildren: () =>
                  Promise.resolve([
                    {
                      key: 'e',
                      path: '/e(/:id)',
                      state: {
                        isReady: false,
                        item: null
                      },
                      subscriptions: route => {
                        const { params } = route
                        return autorun(async () => {
                          route.state.item = await getItem(params.id)
                          route.state.isReady = true
                        })
                      },
                      willResolve: route => when(() => route.state.isReady)
                    }
                  ])
              }
            ])
        }
      ]
    })

    return router.start()
  })

  afterEach(() => router.stop())

  test('errors when serializing during navigation', () => {
    router.push('/c/d/e/123')
    expect(() => serialize(router)).toThrow(/navigating/i)
  })

  test('serialize preserves activated route states', async () => {
    await router.push('/c/d/e/123?q=hello')

    const serialized = serialize(router)

    expect(serialized.activatedRoutes.e.state).toEqual({
      isReady: true,
      item: { id: '123', name: 'Item 123' }
    })
  })

  test('serialize preserves store state', async () => {
    await router.push('/c/d/e/123?q=hello')

    const serialized = serialize(router)

    expect(serialized.store.location).toEqual(expect.objectContaining({ pathname: '/c/d/e/123' }))
    expect(serialized.store.nextKey).toEqual(router._store.nextKey)
  })
})

function getItem(id) {
  return Promise.resolve({ id, name: `Item ${id}` })
}
