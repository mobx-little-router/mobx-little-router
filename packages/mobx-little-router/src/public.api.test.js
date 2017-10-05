// @flow
import { autorun } from 'mobx'
import { createMemoryHistory } from 'history'
import delay from './util/delay'
import { EventTypes } from './events'
import { install, Middleware } from './index'
import { NoMatch } from './errors'

describe('Public API', () => {
  let router

  beforeEach(() => {
    router = install({
      history: createMemoryHistory({ initialEntries: ['/initial'], initialIndex: 0 }),
      getContext: () => ({ message: 'Hello' }),
      routes: [{ path: ':whatever' }]
    })
  })

  test('context chain', () => {
    expect(router.store.state.root.value.getContext()).toEqual({ message: 'Hello' })
  })

  test('reaction to push navigation', async () => {
    const changes = []
    await router.start()

    autorun(() => changes.push(router.store.location.pathname))

    await router.push('/foo')
    await router.push('/bar')

    expect(router.store.location.pathname).toEqual('/bar/')

    await router.goBack()

    expect(router.store.location.pathname).toEqual('/foo/')

    await router.push('/bar')
    await router.replace('/quux')

    expect(router.store.location.pathname).toEqual('/quux/')

    expect(changes).toEqual(['/initial/', '/foo/', '/bar/', '/foo/', '/bar/', '/quux/'])

    expect(router.store.routes.map(route => route.node.value.path)).toEqual([
      '',
      ':whatever'
    ])

    router.stop()
  })

  test('multiple navigation', async () => {
    const changes = []
    await router.start()

    autorun(() => changes.push(router.store.location.pathname))

    router.push('/1')
    router.push('/2')
    router.push('/3')
    router.push('/4')
    router.push('/5')
    router.push('/6')
    router.push('/7')
    router.push('/8')
    router.push('/9')
    await router.push('/10')


    expect(changes).toEqual([
      '/initial/',
      '/10/'
    ])

    expect(router.store.routes.map(route => route.node.value.path)).toEqual([
      '',
      ':whatever'
    ])

    router.stop()
  })

  test('callback API', done => {
    const changes = []
    router.start(_router => {
      expect(_router).toBe(router)

      autorun(() => changes.push(_router.store.location.pathname))

      _router.push('/1').then(() => {
        expect(changes).toEqual(['/initial/', '/1/'])

        expect(_router.store.routes.map(route => route.node.value.path)).toEqual([
          '',
          ':whatever'
        ])

        _router.stop()
        done()
      })
    })
  })

  test('errors', async () => {
    router = install({
      history: createMemoryHistory({ initialEntries: ['/404'] }),
      getContext: () => ({}),
      routes: [{ path: '' }]
    })
    await expect(router.start()).rejects.toEqual(expect.any(NoMatch))
  })

  describe('Events', () => {
    test('subscription', async () => {
      const spy = jest.fn()
      const dispose = router.subscribeEvent(spy)
      await router.start()

      await router.push('/bar')

      expect(spy).toHaveBeenCalled()

      expect(spy.mock.calls.map(x => x[0].type)).toEqual(
        expect.arrayContaining([EventTypes.NAVIGATION_START, EventTypes.NAVIGATION_END])
      )

      expect(
        spy.mock.calls.map(x => x[0].navigation && x[0].navigation.to && x[0].navigation.to.pathname)
      ).toEqual(expect.arrayContaining(['/initial/', '/bar/']))

      dispose()
    })
  })

  describe('total ordering', () => {
    test('navigation is guaranteed to be processed sequentially and in order', async () => {
      const MAX_DURATION = 50
      const spy = jest.fn(() => {
        return delay(Math.random() * MAX_DURATION)
      })
      const router = install({
        history: createMemoryHistory({ initialEntries: ['/initial'], initialIndex: 0 }),
        getContext: () => ({ message: 'Hello' }),
        routes: [{ path: ':whatever', onTransition: spy }]
      })

      const changes = []
      await router.start()

      autorun(() => changes.push(router.store.location.pathname))

      await router.push('/a')
      await router.push('/b')
      await router.push('/c')
      await router.push('/d')

      await delay(MAX_DURATION * 4)

      expect(changes).toEqual(['/initial/', '/a/', '/b/', '/c/', '/d/'])

      router.stop()
    })
  })

  test('catch-all routes', async () => {
    const router = install({
      history: createMemoryHistory({ initialEntries: ['/a'], initialIndex: 0 }),
      getContext: () => ({}),
      routes: [{ path: 'a' }, { path: '**' }]
    })

    const changes = []
    await router.start()

    autorun(() => changes.push(router.store.location.pathname))

    await router.push('/404')

    expect(changes).toEqual(['/a/', '/404/'])

    router.stop()
  })

  test('willResolve hook', async () => {
    const willActivateSpy = jest.fn(() => Promise.resolve())
    const willResolveSpy = jest.fn(() => Promise.resolve())
    const willDeactivateSpy = jest.fn(() => Promise.resolve())

    const router = install({
      history: createMemoryHistory({ initialEntries: ['/a/1'], initialIndex: 0 }),
      getContext: () => ({}),
      routes: [
        {
          path: 'a/:id',
          query: ['q'],
          willActivate: willActivateSpy,
          willResolve: willResolveSpy,
          willDeactivate: willDeactivateSpy
        }
      ]
    })

    await router.start()
    await router.push('/a/2')
    await router.push('/a/2?q=hey')
    await router.push('/a/2?q=now')
    await router.push('/a/2?q=now&w=what')

    expect(willActivateSpy.mock.calls.length).toBe(1)
    expect(willResolveSpy.mock.calls.length).toBe(4)
    expect(willDeactivateSpy.mock.calls.length).toBe(0)

    await router.push('/')

    expect(willDeactivateSpy.mock.calls.length).toBe(1)

    router.stop()
  })

  test('middleware', async () => {
    const middleware = (evt): any => {
      if (evt.type === 'CHILDREN_CONFIG_LOADED') {
        return {
          ...evt,
          module: evt.module.routes
        }
      }
      return evt
    }

    const router = install({
      history: createMemoryHistory({ initialEntries: ['/a'], initialIndex: 0 }),
      getContext: () => ({}),
      middleware: Middleware(middleware),
      routes: [
        {
          path: 'a',
          loadChildren: () => {
            return Promise.resolve({
              routes: [{ path: 'b' }]
            })
          }
        }
      ]
    })

    await router.start()
    await router.push('/a/b')

    expect(router.store.location).toEqual(
      expect.objectContaining({
        pathname: '/a/b/'
      })
    )
  })

  test('getContext() is available on hooks', async () => {
    let stores = {}
    const router = install({
      history: createMemoryHistory({ initialEntries: ['/a'], initialIndex: 0 }),
      getContext: () => ({ stores: { a: false, b: 123 } }),
      routes: [
        {
          path: 'a',
          query: ['q'],
          canActivate: (route) => {
            stores = route.context.stores
            return Promise.resolve()
          }
        }
      ]
    })

    await router.start()

    expect(stores.a).toEqual(false)
    expect(stores.b).toEqual(123)
  })

  test('dynamic children', async () => {
    const spy = jest.fn(() => Promise.resolve([
      { path: '' }
    ]))
    const router = install({
      history: createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 }),
      getContext: () => ({ stores: { a: false, b: 123 } }),
      routes: [
        {
          path: '',
          loadChildren: spy
        }
      ]
    })

    await router.start()

    expect(router.store.location.pathname).toEqual('/')

    expect(spy).toHaveBeenCalled()
  })
})
