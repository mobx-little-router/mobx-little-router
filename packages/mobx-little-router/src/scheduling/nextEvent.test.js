// @flow
import { EventTypes } from '../events'
import RouterStore from '../model/RouterStore'
import createRouteStateTreeNode from '../model/createRouteStateTreeNode'
import Navigation from '../model/Navigation'
import nextEvent from './nextEvent'

describe('nextEvent', () => {
  let store
  let root

  beforeEach(() => {
    root = createRouteStateTreeNode({
      path: '',
      children: [
        {
          path: '',
          loadChildren: () => Promise.resolve([{ path: 'a' }, { path: 'b' }])
        }
      ]
    })
    store = new RouterStore(root)
  })

  test('Dynamically loading children from a partially matched empty leaf', async () => {
    const events = []
    let curr

    curr = await nextEvent(
      {
        type: EventTypes.NAVIGATION_START,
        navigation: new Navigation({
          type: 'PUSH',
          to: { pathname: '/' }
        })
      },
      store
    )
    events.push(curr)

    let count = 0

    // Try to resolve the navigation within a limited number of steps.
    while (count < 20) {
      curr = await nextEvent(curr, store)
      events.push(curr)
      if (
        curr.type === EventTypes.NAVIGATION_END ||
        curr.type === EventTypes.NAVIGATION_CANCELLED
      ) {
        break
      }
      count++
    }

    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: EventTypes.NAVIGATION_MATCH_RESULT }),
        expect.objectContaining({ type: EventTypes.NAVIGATION_ACTIVATED }),
        expect.objectContaining({ type: EventTypes.CHILDREN_CONFIG_REQUEST }),
        expect.objectContaining({ type: EventTypes.CHILDREN_CONFIG_LOAD }),
        expect.objectContaining({ type: EventTypes.CHILDREN_LOAD }),
        expect.objectContaining({ type: EventTypes.NAVIGATION_END })
      ])
    )
  })
})
