// @flow
import { toJS } from 'mobx'
import RouterStore from '../routing/RouterStore'
import Scheduler from './Scheduler'
import createRouteNode from '../routing/createRouteNode'
import delay from '../util/delay'

describe('Scheduler', () => {
  let scheduler, store
  let resolveActivate,
    rejectActivate,
    onEnter,
    onLeave,
    onError,
    resolveDeactivate,
    rejectDeactivate

  beforeEach(() => {
    store = new RouterStore()
    onEnter = jest.fn(() => Promise.resolve())
    onLeave = jest.fn(() => Promise.resolve())
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
        onEnter: [onEnter],
        onLeave: [onLeave],
        onError: [onError],
        canDeactivate: [
          (node, params) => {
          console.log('????')
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
      scheduler.scheduleNavigation(
        {
          pathname: '/pressly'
        },
        'PUSH'
      )

      const { navigation } = scheduler

      if (navigation) {
        expect(navigation.location.pathname).toEqual('/pressly')
        expect(toJS(navigation.parts)).toEqual(['', 'pressly'])
        expect(navigation.action).toEqual('PUSH')
      } else {
        throw new Error()
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

      // Enter lifecycle method should not be called.
      expect(onEnter).not.toHaveBeenCalled()
    })

    test('activation guard passes', async () => {
      scheduler.scheduleNavigation(
        {
          pathname: '/pressly'
        },
        'PUSH'
      )

      const { navigation } = scheduler

      if (navigation) {
        expect(navigation.location.pathname).toEqual('/pressly')
        expect(toJS(navigation.parts)).toEqual(['', 'pressly'])
        expect(navigation.action).toEqual('PUSH')
      } else {
        throw new Error()
      }

      const navPromise = scheduler.processNavigation()
      await delay(0)

      resolveActivate()

      await navPromise

      // Navigation should be processed.
      expect(toJS(store.location)).toEqual({ pathname: '/pressly' })

      // Navigation is cleared.
      expect(scheduler.navigation).toBe(null)

      // Enter lifecycle method should be called.
      expect(onEnter).toHaveBeenCalled()
    })
  })

  test.only('deactivation', async () => {
    // Mark
    store.activateNodes([
      store.state.root,
      store.state.root.children[0]
    ])

    scheduler.scheduleNavigation(
      {
        pathname: '/'
      },
      'PUSH'
    )

    const { navigation } = scheduler

    if (navigation) {
      expect(navigation.location.pathname).toEqual('/')
      expect(toJS(navigation.parts)).toEqual(['', ''])
      expect(navigation.action).toEqual('PUSH')
    } else {
      throw new Error()
    }

    const navPromise = scheduler.processNavigation()
    await delay(0)

    resolveDeactivate()

    await navPromise

    // Navigation should be processed.
    expect(toJS(store.location)).toEqual({ pathname: '/pressly' })

    // Navigation is cleared.
    expect(scheduler.navigation).toBe(null)

    // Enter lifecycle method should be called.
    expect(onEnter).toHaveBeenCalled()
  })
})
