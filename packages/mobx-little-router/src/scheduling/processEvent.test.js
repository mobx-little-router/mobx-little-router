// @flow
import { runInAction } from 'mobx'
import { EventTypes } from '../events'
import RouterStore from '../model/RouterStore'
import createRouteStateTreeNode from '../model/createRouteStateTreeNode'
import createRoute from '../model/createRoute'
import Navigation from '../model/Navigation'
import processEvent from './processEvent'
import { NoMatch } from '../errors'

describe('processEvent', () => {
  let store
  let root

  beforeEach(() => {
    root = createRouteStateTreeNode({
      path: '',
      children: [
        {
          path: '',
          loadChildren: () => Promise.resolve([{ path: 'a' }, { path: 'b' }])
        },
        { path: '**' }
      ]
    })
    store = new RouterStore(root)
  })

  test('dynamically loading children from a partially matched empty leaf', async () => {
    const events = await takeWhileIncomplete(
      {
        type: EventTypes.NAVIGATION_START,
        navigation: new Navigation({
          type: 'PUSH',
          to: { pathname: '/' }
        })
      },
      store
    )

    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: EventTypes.NAVIGATION_RESULT_MATCHED }),
        expect.objectContaining({ type: EventTypes.CHILDREN_CONFIG_REQUESTED }),
        expect.objectContaining({ type: EventTypes.CHILDREN_CONFIG_LOADED }),
        expect.objectContaining({ type: EventTypes.CHILDREN_LOADING }),
        expect.objectContaining({ type: EventTypes.NAVIGATION_ACTIVATED }),
        expect.objectContaining({ type: EventTypes.NAVIGATION_END })
      ])
    )
  })

  test('navigation results in catch-all when no match found', async () => {
    const events = await takeWhileIncomplete(
      {
        type: EventTypes.NAVIGATION_START,
        navigation: new Navigation({
          type: 'PUSH',
          to: { pathname: '/c' }
        })
      },
      store
    )

    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: EventTypes.NAVIGATION_ACTIVATED,
          routes: expect.arrayContaining([
            expect.objectContaining({
              node: expect.objectContaining({
                value: expect.objectContaining({ path: '**' })
              }),
              segment: '/c'
            })
          ])
        })
      ])
    )
  })

  test('unmatched navigation', async () => {
    const store = new RouterStore(createRouteStateTreeNode({ path: '' }))

    const events = await takeWhileIncomplete(
      {
        type: EventTypes.NAVIGATION_START,
        navigation: new Navigation({
          type: 'PUSH',
          to: { pathname: '/nope/nope/nope' }
        })
      },
      store
    )
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: EventTypes.NAVIGATION_ERROR,
          error: expect.any(NoMatch)
        })
      ])
    )
  })

  test('cancel event clears previous routes on store', async () => {
    runInAction(() => {
      store.prevRoutes.replace([createRoute(store.state.root, '/', {}, {})])
    })

    await processEvent({
      type: EventTypes.NAVIGATION_CANCELLED,
      done: true,
      navigation: null,
      nextNavigation: null
    }, store)

    expect(store.prevRoutes.length).toEqual(0)
  })

  test('cancel event clears previous routes on store', async () => {
    runInAction(() => {
      store.prevRoutes.replace([createRoute(store.state.root, '/', {}, {})])
    })

    await processEvent({
      type: EventTypes.NAVIGATION_END,
      done: true,
      navigation: new Navigation({
        type: 'POP',
        to: null,
        from: null
      })
    }, store)

    expect(store.prevRoutes.length).toEqual(0)
  })

  test('handles errors', async () => {
    const x: any = null

    let result = await processEvent(x, x)
    expect(result).toEqual(expect.objectContaining({
      type: EventTypes.NAVIGATION_ERROR
    }))

    const y: any ={ type: EventTypes.NAVIGATION_ACTIVATED }
    result = await processEvent(y, x)
    expect(result).toEqual(expect.objectContaining({
      type: EventTypes.NAVIGATION_ERROR
    }))
  })
})

async function takeWhileIncomplete(curr, store) {
  if (curr === null) {
    return []
  }

  const events = []
  let count = 0

  // Try to resolve the navigation within a limited number of steps.
  while (count < 20) {
    curr = await processEvent(curr, store)
    if (curr === null) {
      break
    }
    events.push(curr)
    if (
      curr.type === EventTypes.NAVIGATION_END ||
      curr.type === EventTypes.NAVIGATION_CANCELLED
    ) {
      return events
    }
    count++
  }
  return events
}
