// @flow
import { toJS } from 'mobx'
import RouterStore from '../routing/RouterStore'
import Scheduler from './Scheduler'
import createRouteNode from '../routing/createRouteNode'
import delay from '../util/delay'

describe('Scheduler', () => {
  let scheduler, store

  beforeEach(() => {
    store = createStore()
    scheduler = new Scheduler(store)
  })

  describe('Scheduling and processing navigation', () => {
    test('Activation guard fails', async () => {
      scheduler.scheduleNavigation(
        {
          pathname: '/todos'
        },
        'PUSH'
      )

      const { navigation } = scheduler

      if (navigation) {
        expect(navigation.location.pathname).toEqual('/todos')
        expect(toJS(navigation.parts)).toEqual(['', 'todos'])
        expect(navigation.action).toEqual('PUSH')
      } else {
        throw new Error()
      }

      const navPromise = scheduler.processNavigation()
      await delay(0)

      // Make the guard fail!
      // rejectActivate()

      await navPromise

      // Navigation should be blocked.
      expect(store.location).toBe(null)

      // Navigation is cleared.
      expect(scheduler.navigation).toBe(null)

      // Enter lifecycle method should not be called.
      // expect(onEnter).not.toHaveBeenCalled()
    })

    test('Activation guard passes', async () => {
      scheduler.scheduleNavigation(
        {
          pathname: '/todos'
        },
        'PUSH'
      )

      const { navigation } = scheduler

      if (navigation) {
        expect(navigation.location.pathname).toEqual('/todos')
        expect(toJS(navigation.parts)).toEqual(['', 'todos'])
        expect(navigation.action).toEqual('PUSH')
      } else {
        throw new Error()
      }

      const navPromise = scheduler.processNavigation()
      await delay(0)

      // resolveActivate()

      await navPromise

      // Navigation should be processed.
      expect(toJS(store.location)).toEqual({ pathname: '/todos' })

      // Navigation is cleared.
      expect(scheduler.navigation).toBe(null)

      // Enter lifecycle method should be called.
      // expect(onEnter).toHaveBeenCalled()
    })
  })

  test.only('Deactivation successful', async () => {
    store.setLocation({ pathname: '/todos' })
    store.activateNodes([store.state.root, store.state.root.children[0]])

    scheduler.scheduleNavigation({ pathname: '/' }, 'PUSH')

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

    await navPromise

    // Navigation should be processed.
    expect(toJS(store.location)).toEqual({ pathname: '/' })

    // Navigation is cleared.
    expect(scheduler.navigation).toBe(null)
  })

  function createStore() {
    const store = new RouterStore()
    store.replaceChildren(store.state.root, [
      createRouteNode({
        path: '',
        children: []
      }),
      createRouteNode({
        path: 'todos',
        children: [
          {
            path: '',
            children: []
          },
          {
            path: ':id',
            children: []
          }
        ]
      })
    ])
    return store
  }
})
