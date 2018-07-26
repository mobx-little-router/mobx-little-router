// @flow
import { autorun, toJS, when } from 'mobx'
import { createMemoryHistory } from 'history'
import { install, serialize } from './index'

describe('SSR', () => {
  test.only('to and from JS for server-side rendering', async () => {
    let activeRouterNumber = null
    const activeRoutesSpy = jest.fn()
    const stateSpy = jest.fn()
    const paramsSpy = jest.fn()

    const ROUTES = [
      { key: 'home', path: '/' },
      {
        key: 'a',
        path: '/a/:id',
        state: {
          flag: false.valueOf()
        },
        willResolve: route =>
          when(() => route.state.flag).then(() => {
            stateSpy({
              routerNumber: activeRouterNumber,
              in: 'willResolve',
              value: toJS(route.state)
            })
          }),
        subscriptions(route) {
          const { params } = route
          return autorun(() => {
            paramsSpy({
              routerNumber: activeRouterNumber,
              in: 'subscriptions',
              value: toJS(params)
            })
            stateSpy({
              routerNumber: activeRouterNumber,
              in: 'subscriptions',
              value: toJS(route.state)
            })
            if (params.id) {
              route.state.flag = true
            }
          })
        }
      }
    ]

    const router1 = install({
      history: createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 }),
      routes: ROUTES
    })

    activeRouterNumber = 1
    autorun(() => {
      activeRoutesSpy({
        routeNumber: activeRouterNumber,
        routes: router1.activatedRoutes.map(x => x.node.value.key)
      })
    })
    await router1.start()
    await router1.push('/a/1')

    const router2 = install({
      history: createMemoryHistory({ initialEntries: ['/a/1'], initialIndex: 0 }),
      routes: ROUTES,
      ssr: {
        state: serialize(router1)
      }
    })

    activeRouterNumber = 2
    autorun(() => {
      activeRoutesSpy({
        routeNumber: activeRouterNumber,
        routes: router2.activatedRoutes.map(x => x.node.value.key)
      })
    })
    await router2.start()

    expect(stateSpy.mock.calls.map(x => x[0])).toEqual([
      { routerNumber: 1, in: 'subscriptions', value: { flag: false } },
      { routerNumber: 1, in: 'willResolve', value: { flag: true } },

      // Route state is restored from serialized state.
      { routerNumber: 2, in: 'subscriptions', value: { flag: true } },
      { routerNumber: 2, in: 'willResolve', value: { flag: true } }
    ])

    expect(paramsSpy.mock.calls.map(x => x[0])).toEqual([
      { routerNumber: 1, in: 'subscriptions', value: { id: '1' } },
      { routerNumber: 2, in: 'subscriptions', value: { id: '1' } }
    ])

    expect(activeRoutesSpy.mock.calls.map(x => x[0])).toEqual([
      { routeNumber: 1, routes: [] },
      { routeNumber: 1, routes: ['@@ROOT', 'home'] },
      { routeNumber: 1, routes: ['@@ROOT', 'a'] },

      // Activated route is restored from serialized state.
      { routeNumber: 2, routes: [] },

      { routeNumber: 2, routes: ['@@ROOT', 'a'] }
    ])

    router1.stop()
    router2.stop()
  })
})
