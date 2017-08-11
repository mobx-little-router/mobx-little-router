// @flow
import { toJS } from 'mobx'
import RouterStore from './RouterStore'
import Scheduler from './Scheduler'
import createRouteNode from './createRouteNode'
import delay from '../util/delay'

describe('Scheduler', () => {
  let scheduler, store
  let resolveActivate, rejectActivate, onError, resolveDeactivate, rejectDeactivate

  beforeEach(() => {
    store = new RouterStore()
    onError = jest.fn(() => Promise.resolve())
    store.replaceChildren(store.state.root, [
      createRouteNode({
        path: '',
        children: []
      }),
      createRouteNode({
        path: ':username',
        canActivate: [
          (node, params) => {
            return new Promise((res, rej) => {
              resolveActivate = res
              rejectActivate = rej
            })
          }
        ],
        onError: [onError],
        canDeactivate: [
          (node, params) => {
            return new Promise((res, rej) => {
              resolveDeactivate = res
              rejectDeactivate = rej
            })
          }
        ],
        children: []
      })
    ])
    scheduler = new Scheduler(store)
  })

  describe('scheduling and processing navigation', () => {
    test('activation guard fails', async () => {
      const schedulePromise = scheduler.scheduleNavigation(
        {
          pathname: '/pressly/news'
        },
        'PUSH'
      )

      const { navigation } = scheduler

      if (navigation) {
        expect(navigation.location.pathname).toEqual('/pressly/news')
        expect(toJS(navigation.parts)).toEqual(['', 'pressly', 'news'])
        expect(navigation.action).toEqual('PUSH')
        expect(schedulePromise).toBeDefined()
      } else {
        expect(false).toBe(true)
      }

      const navPromise = scheduler.processNavigation()
      await delay(0)

      // Make the guard fail!
      rejectActivate()

      await navPromise

      // Navigation should be blocked.
      expect(store.location).toBe(null)

      // Navigation is cleared.
      expect(scheduler.navigation).toBe(null)
    })

    test('activation guard passes', async () => {
      const schedulePromise = scheduler.scheduleNavigation(
        {
          pathname: '/pressly/news'
        },
        'PUSH'
      )

      const { navigation } = scheduler

      if (navigation) {
        expect(navigation.location.pathname).toEqual('/pressly/news')
        expect(toJS(navigation.parts)).toEqual(['', 'pressly', 'news'])
        expect(navigation.action).toEqual('PUSH')
        expect(schedulePromise).toBeDefined()
      } else {
        expect(false).toBe(true)
      }

      const navPromise = scheduler.processNavigation()
      await delay(0)

      // Make the guard fail!
      resolveActivate()

      await navPromise

      // Navigation should be processed.
      expect(toJS(store.location)).toEqual({ pathname: '/pressly/news'})

      // Navigation is cleared.
      expect(scheduler.navigation).toBe(null)
    })
  })
})
