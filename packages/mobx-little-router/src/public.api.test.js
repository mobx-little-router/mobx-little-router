// @flow
import { autorun } from 'mobx'
import { createMemoryHistory } from 'history'
import delay from './util/delay'
import { EventTypes } from './events'
import { install, Middleware } from './index'
import { NotFound } from './errors'

describe('Public API', () => {
  let router

  beforeEach(() => {
    router = install({
      history: createMemoryHistory({ initialEntries: ['/initial'], initialIndex: 0 }),
      getContext: () => ({ message: 'Hello' }),
      routes: [
        {
          path: 'a',
          key: 'a',
          children: [
            { path: '', redirectTo: 'c' },
            { path: 'b', redirectTo: 'c' },
            { path: 'c' }
          ]
        },
        {
          key: 'account',
          path: 'account/:id',
          children: [
            {
              key: 'hub',
              path: 'hub/:id'
            }
          ]
        },
        {
          path: ':whatever',
          key: 'whatever',
          children: [
            { path: ':thing', key: 'thing' }
          ]
        }
      ]
    })
  })

  test('getParam', async () => {
    await router.start()

    const ids = []

    const dispose = autorun(() => {
      const accountId = router.getParam('account', 'id')
      ids.push(accountId)
    })

    await router.push('/account/1/hub/2')

    expect(router.getParam('account', 'id')).toBe('1')
    expect(router.getParam('hub', 'id')).toBe('2')

    await router.push('/account/3/hub/4')

    expect(router.getParam('account', 'id')).toBe('3')
    expect(router.getParam('hub', 'id')).toBe('4')

    expect(ids).toEqual([undefined, '1', '3'])

    dispose()
    router.stop()
  })

  test('context chain', () => {
    expect(router._store.state.root.value.getContext()).toEqual({ message: 'Hello' })
  })

  test('reaction to push navigation', async () => {
    const changes = []
    await router.start()

    autorun(() => changes.push(router.location.pathname))

    await router.push('/foo')
    await router.push('/bar')

    expect(router.location.pathname).toEqual('/bar')

    await router.goBack()

    expect(router.location.pathname).toEqual('/foo')

    await router.push('/bar')
    await router.replace('/quux')

    expect(router.location.pathname).toEqual('/quux')

    expect(changes).toEqual(['/initial', '/foo', '/bar', '/foo', '/bar', '/quux'])

    expect(router._store.activatedRoutes.map(route => route.node.value.path)).toEqual([
      '',
      ':whatever'
    ])

    router.stop()
  })

  test('multiple navigation', async () => {
    const changes = []
    await router.start()

    autorun(() => changes.push(router.location.pathname))

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

    expect(changes).toEqual(['/initial', '/10'])

    expect(router._store.activatedRoutes.map(route => route.node.value.path)).toEqual([
      '',
      ':whatever'
    ])

    router.stop()
  })

  test('callback API', done => {
    const changes = []
    router.start(_router => {
      expect(_router).toBe(router)

      autorun(() => changes.push(_router.location.pathname))

      _router.push('/1').then(() => {
        expect(changes).toEqual(['/initial', '/1'])

        expect(_router._store.activatedRoutes.map(route => route.node.value.path)).toEqual([
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
    await expect(router.start()).rejects.toEqual(expect.any(NotFound))
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
        spy.mock.calls.map(
          x => x[0].navigation && x[0].navigation.to && x[0].navigation.to.pathname
        )
      ).toEqual(expect.arrayContaining(['/initial', '/bar']))

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

      autorun(() => changes.push(router.location.pathname))

      await router.push('/a')
      await router.push('/b')
      await router.push('/c')
      await router.push('/d')

      await delay(MAX_DURATION * 4)

      expect(changes).toEqual(['/initial', '/a', '/b', '/c', '/d'])

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

    autorun(() => changes.push(router.location.pathname))

    await router.push('/404')

    expect(changes).toEqual(['/a', '/404'])

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

  test('willResolve hook rejecting', async () => {
    let isAuthenticated = false
    const willResolveSpy = jest.fn(() => isAuthenticated ? Promise.resolve() : Promise.reject())
    const willResolveChildSpy = jest.fn(() => Promise.resolve())

    const router = install({
      history: createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 }),
      getContext: () => ({}),
      routes: [
        {
          path: 'a/:id',
          query: ['q'],
          willResolve: willResolveSpy,
          children: [
            {
              path: 'child',
              willResolve: willResolveChildSpy
            }
          ]
        }
      ]
    })

    await router.start()

    await router.push('/a/2/child')

    expect(router.location.pathname).toBe('/')
    expect(willResolveSpy.mock.calls.length).toBe(1)
    expect(willResolveChildSpy.mock.calls.length).toBe(0)

    isAuthenticated = true

    await router.push('/a/2/child')

    expect(router.location.pathname).toBe('/a/2/child')
    expect(willResolveSpy.mock.calls.length).toBe(2)
    expect(willResolveChildSpy.mock.calls.length).toBe(1)

    router.stop()
  })

  test('Resolving and Entering properly', async () => {
    let stack = []

    const canActivateSpy1 = jest.fn(() => {
      stack.push('canActivate1')
      return Promise.resolve()
    })
    const canActivateSpy2 = jest.fn(() => {
      stack.push('canActivate2')
      return Promise.resolve()
    })
    const canActivateSpy3 = jest.fn(() => {
      stack.push('canActivate3')
      return Promise.resolve()
    })

    const willActivateSpy1 = jest.fn(() => {
      stack.push('willActivate1')
      return Promise.resolve()
    })
    const willActivateSpy2 = jest.fn(() => {
      stack.push('willActivate2')
      return Promise.resolve()
    })
    const willActivateSpy3 = jest.fn(() => {
      stack.push('willActivate3')
      return Promise.resolve()
    })

    const willResolveSpy1 = jest.fn(() => {
      stack.push('willResolve1')
      return Promise.resolve()
    })
    const willResolveSpy2 = jest.fn(() => {
      stack.push('willResolve2')
      return Promise.resolve()
    })
    const willResolveSpy3 = jest.fn(() => {
      stack.push('willResolve3')
      return Promise.resolve()
    })
    const onEnterSpy1 = jest.fn()
    const onEnterSpy2 = jest.fn()
    const onEnterSpy3 = jest.fn()

    const router = install({
      history: createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 }),
      routes: [
        {
          path: ':username',
          canActivate: canActivateSpy1,
          willActivate: willActivateSpy1,
          willResolve: willResolveSpy1,
          onEnter: onEnterSpy1,
          children: [{
            path: '',
            canActivate: canActivateSpy2,
            willActivate: willActivateSpy2,
            willResolve: willResolveSpy2,
            onEnter: onEnterSpy2,
            children: [{
              path: 'settings',
              canActivate: canActivateSpy3,
              willActivate: willActivateSpy3,
              willResolve: willResolveSpy3,
              onEnter: onEnterSpy3
            }]
          }]
        }
      ]
    })

    let activating = [], entering = []
    const dispose = router.subscribeEvent((ev) => {
      if (ev.type === EventTypes.NAVIGATION_ACTIVATED) {
        activating = ev.activating
        entering = ev.entering
      }
    })

    // The root
    await router.start()

    expect(activating.length).toBe(1)
    expect(entering.length).toBe(1)

    await router.push('/joe/settings')

    expect(router._store.activatedRoutes[2].params.username).toBe('joe')

    expect(activating.length).toBe(3)
    expect(entering.length).toBe(3)

    expect(willResolveSpy1.mock.calls.length).toBe(1)
    expect(willResolveSpy2.mock.calls.length).toBe(1)
    expect(willResolveSpy3.mock.calls.length).toBe(1)

    expect(onEnterSpy1.mock.calls.length).toBe(1)
    expect(onEnterSpy2.mock.calls.length).toBe(1)

    expect(onEnterSpy3.mock.calls.length).toBe(1)

    expect(stack).toEqual([
      'canActivate1',
      'willActivate1',
      'willResolve1',
      'canActivate2',
      'willActivate2',
      'willResolve2',
      'canActivate3',
      'willActivate3',
      'willResolve3'
    ])

    stack = []

    // Changing the username will not reactivate the username route
    // but it should trigger reactivation of everything after that
    // It should also rerun all resolvers
    await router.push('/lenny/settings')

    expect(router._store.activatedRoutes[2].params.username).toBe('lenny')

    expect(activating.length).toBe(2)
    expect(entering.length).toBe(3)

    expect(willResolveSpy1.mock.calls.length).toBe(2)
    expect(willResolveSpy2.mock.calls.length).toBe(2) // Error here
    expect(willResolveSpy3.mock.calls.length).toBe(2) // Error here

    expect(onEnterSpy1.mock.calls.length).toBe(2)
    expect(onEnterSpy2.mock.calls.length).toBe(2)
    expect(onEnterSpy3.mock.calls.length).toBe(2)


    expect(stack).toEqual([
      'willResolve1',
      'canActivate2',
      'willActivate2',
      'willResolve2',
      'canActivate3',
      'willActivate3',
      'willResolve3'
    ])

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

    expect(router.location).toEqual(
      expect.objectContaining({
        pathname: '/a/b'
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
          canActivate: route => {
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

  test('onError can recover from route error', async () => {
    const ARouteHandler = () => 'ARouteHandler'
    const BRouteHandler = () => 'BRouteHandler'

    const willResolveSpy = jest.fn(() => Promise.resolve())

    const router = install({
      history: createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 }),
      routes: [
        {
          path: 'a',
          getData: () => ({
            component: ARouteHandler
          }),
          willResolve: () => Promise.reject(),
          onError: (route, navigation, err) => {
            return Promise.resolve()
          },
          children: [
            {
              path: 'b',
              getData: () => ({
                component: BRouteHandler
              }),
              willResolve: willResolveSpy
            }
          ]
        }
      ]
    })

    await router.start()

    await router.push('/a/b')

    expect(router.location.pathname).toBe('/a/b')

    expect(router._store.activatedRoutes[1].data.component).toBe(ARouteHandler)
    expect(router._store.activatedRoutes[2].data.component).toBe(BRouteHandler)
    expect(willResolveSpy.mock.calls.length).toBe(0)

    router.stop()
  })

  test('onError can redirect on route error', async () => {
    const ARouteHandler = () => 'ARouteHandler'
    const BRouteHandler = () => 'BRouteHandler'

    let isAuthenticated = false

    const willResolveSpy = jest.fn(() => Promise.resolve())

    const router = install({
      history: createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 }),
      routes: [
        {
          path: 'a',
          willResolve: () => Promise.reject(),
          onError: (route, navigation, err) => {
            return navigation.redirectTo('b')
          },
        },
        {
          path: 'b',
          willResolve: willResolveSpy
        }
      ]
    })

    await router.start()

    await router.push('/a')

    expect(router.location.pathname).toBe('/b')

    expect(willResolveSpy.mock.calls.length).toBe(1)

    router.stop()
  })

  test('dynamic children', async () => {
    const resolveSpy = jest.fn(() => Promise.resolve())
    const spy = jest.fn(() => Promise.resolve([{ path: '', willResolve: resolveSpy }]))
    const router = install({
      history: createMemoryHistory({ initialEntries: ['/'] }),
      getContext: () => ({ stores: { a: false, b: 123 } }),
      routes: [
        {
          path: '',
          loadChildren: spy
        }
      ]
    })

    await router.start()

    expect(router.location.pathname).toEqual('/')
    expect(router._scheduler.event.type).toEqual(EventTypes.NAVIGATION_END)

    expect(spy).toHaveBeenCalled()
    expect(resolveSpy).toHaveBeenCalled()
  })

  test('route segments are correct', async () => {
    const router = install({
      history: createMemoryHistory({ initialEntries: ['/a'], initialIndex: 0 }),
      getContext: () => {},
      routes: [
        {
          path: 'a',
          children: [
            {
              path: 'b',
              children: [
                {
                  path: 'c'
                }
              ]
            }
          ]
        }
      ]
    })

    await router.start()

    await delay(0)

    expect(router.location.pathname).toEqual('/a')
    expect(getLastRoute(router).segment).toBe('/a')

    router.push('/a/b')

    await delay(0)

    expect(router.location.pathname).toEqual('/a/b')
    expect(getLastRoute(router).segment).toBe('/b')

    router.push('/a/b/c')

    await delay(0)

    expect(router.location.pathname).toEqual('/a/b/c')
    expect(getLastRoute(router).segment).toBe('/c')

    router.stop()
  })

  test('route parentUrls are correct', async () => {
    const router = install({
      history: createMemoryHistory({ initialEntries: ['/a'], initialIndex: 0 }),
      getContext: () => {},
      routes: [
        {
          path: 'a',
          children: [
            {
              path: 'b',
              children: [
                {
                  path: 'c'
                }
              ]
            }
          ]
        }
      ]
    })

    await router.start()

    await delay(0)

    expect(router.location.pathname).toEqual('/a')
    expect(getLastRoute(router).parentUrl).toBe('')

    router.push('/a/b')

    await delay(0)

    expect(router.location.pathname).toEqual('/a/b')
    expect(getLastRoute(router).parentUrl).toBe('/a')

    router.push('/a/b/c')

    await delay(0)

    expect(router.location.pathname).toEqual('/a/b/c')
    expect(getLastRoute(router).parentUrl).toBe('/a/b')

    router.stop()
  })

  test('redirectTo from index route', async () => {
    const router = install({
      history: createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 }),
      getContext: () => {},
      routes: [
        {
          path: 'a',
          children: [
            { path: 'b' }, // Should go here
            { path: '', redirectTo: 'b' }
          ]
        },
        { path: 'b' }
      ]
    })

    await router.start()

    expect(router.location.pathname).toEqual('/')

    router.push('/a')

    await delay(200)

    expect(router.location.pathname).toEqual('/a/b')

    router.stop()
  })

  test('redirectTo from child route', async () => {
    const router = install({
      history: createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 }),
      getContext: () => {},
      routes: [
        {
          path: 'a',
          children: [
            { path: 'b' }, // Should go here
            { path: 'c', redirectTo: 'b' }
          ]
        }
      ]
    })

    await router.start()

    expect(router.location.pathname).toEqual('/')

    router.push('/a/c')

    await delay(200)

    expect(router.location.pathname).toEqual('/a/b')

    router.stop()
  })

  test('redirectTo from index route with navigation.redirectTo', async () => {
    const router = install({
      history: createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 }),
      getContext: () => {},
      routes: [
        {
          path: 'a',
          children: [
            { path: 'b' }, // Should go here
            { path: '', willActivate: (route, navigation) => navigation.redirectTo('b') }
          ]
        },
        { path: 'b' }
      ]
    })

    await router.start()

    expect(router.location.pathname).toEqual('/')

    router.push('/a')

    await delay(200)

    expect(router.location.pathname).toEqual('/a/b')

    router.stop()
  })

  test('redirectTo from child route with navigation.redirectTo', async () => {
    const router = install({
      history: createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 }),
      getContext: () => {},
      routes: [
        {
          path: 'a',
          children: [
            { path: 'b' }, // Should go here
            { path: 'c', willActivate: (route, navigation) => navigation.redirectTo('b') }
          ]
        }
      ]
    })

    await router.start()

    expect(router.location.pathname).toEqual('/')

    router.push('/a/c')

    await delay(200)

    expect(router.location.pathname).toEqual('/a/b')

    router.stop()
  })

  test('redirectTo multiple redirects', async () => {
    const router = install({
      history: createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 }),
      getContext: () => {},
      routes: [
        {
          path: 'a',
          children: [
            {
              path: 'b',
              children: [
                { path: 'd' }, // 3) End up here
                { path: '', redirectTo: 'd' } // 2) Now redirect from here
              ]
            },
            { path: 'c', redirectTo: 'b' } // 1) redirect from here first
          ]
        }
      ]
    })

    await router.start()

    expect(router.location.pathname).toEqual('/')

    router.push('/a/c')

    await delay(200)

    expect(router.location.pathname).toEqual('/a/b/d')

    router.stop()
  })

  test('redirectTo inside a dynamic children', async () => {
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
      history: createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 }),
      getContext: () => {},
      middleware: Middleware(middleware),
      routes: [
        {
          path: 'a',
          loadChildren: () => {
            return Promise.resolve({
              routes: [
                {
                  path: 'b',
                  loadChildren: () => {
                    return Promise.resolve({
                      routes: [
                        { path: 'c' }, // 3) End up here
                        { path: '', redirectTo: 'c' } // 2) Now redirect from here
                      ]
                    })
                  }
                }
              ]
            })
          }
        }
      ]
    })

    await router.start()

    expect(router.location.pathname).toEqual('/')

    router.push('/a/b')

    await delay(200)

    expect(router.location.pathname).toEqual('/a/b/c')

    router.stop()
  })

  test('router navigation within activation function', async () => {
    const spy = jest.fn(() => router.replace('/b'))
    router = install({
      history: createMemoryHistory({ initialEntries: ['/a'] }),
      getContext: () => ({ message: 'Hello' }),
      routes: [
        {
          path: 'a',
          willActivate: spy
        },
        { path: 'b' }
      ]
    })

    await router.start()

    expect(router._scheduler.event.type).toEqual(EventTypes.NAVIGATION_END)
    expect(spy).toHaveBeenCalled()
    expect(router.location.pathname).toEqual('/b')
  })

  test('router starts with rejection if guard fails', async () => {
    const types = ['willResolve', 'willActivate', 'canActivate']
    for (const type of types) {
      router = install({
        history: createMemoryHistory({ initialEntries: ['/'] }),
        getContext: () => ({}),
        routes: [
          {
            path: '',
            [type]: () => Promise.reject('Nope')
          }
        ]
      })

      await expect(router.start()).rejects.toEqual(expect.anything())
    }
  })

  test('looking node up by key', async () => {
    await router.start()
    // Ignore nulls by casting to `any`.
    const a: any = router.getNode('whatever')
    const b: any = router.getNode('thing')
    expect(a.value.key).toEqual('whatever')
    expect(b.value.key).toEqual('thing')
  })

  test('calling error handler when route rejects', async () => {
    const errorSpy = jest.fn(() => Promise.resolve())
    router = install({
      history: createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 }),
      routes: [
        {
          path: '',
          willActivate: () => Promise.reject(),
          onError: errorSpy
        }
      ]
    })

    await router.start()

    expect(errorSpy).toHaveBeenCalled()
  })

  test('boundary cases', async () => {
    router = install({
      history: createMemoryHistory({initialEntries: ['/**'], initialIndex: 0}),
      routes: [{ path: '**' }]
    })
    await router.start()

    expect(router.location.pathname).toEqual('/**')
  })

  test('route instance differs based on param values', async () => {
    await router.start()

    await router.push('/foo')
    const [_, whateverRoute1] = router.activatedRoutes.slice()

    await router.push('/bar')
    const [__, whateverRoute2] = router.activatedRoutes.slice()

    expect(whateverRoute1).not.toBe(whateverRoute2)
  })
})

const getLastRoute = router => {
  return router.activatedRoutes[router.activatedRoutes.length - 1]
}
