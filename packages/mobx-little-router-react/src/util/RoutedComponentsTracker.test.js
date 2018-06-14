// @flow
import { when } from 'mobx'
import { EventTypes } from 'mobx-little-router'
import { createMemoryHistory } from 'history'
import { install } from '../index'
import * as React from 'react'
import RoutedComponentsTracker from './RoutedComponentsTracker'

const RouteHandlerA = (props) => <div>{props.route.params.thing}</div>

describe('RoutedComponentsTracker', () => {
  let router
  let tracker

  beforeEach(() => {
    router = install({
      history: createMemoryHistory({ initialEntries: ['/one'] }),
      routes: [
        { key: 'test', path: '/:thing', component: RouteHandlerA }
      ]
    })

    tracker = new RoutedComponentsTracker(router, undefined, 0)
    tracker.start()

    return router.start()
  })

  afterEach(() => {
    router.stop()
    tracker.stop()
  })

  test('provides `to` and `from` routes during transitions', async () => {
    router.push('/two')

    await waitUntil(EventTypes.NAVIGATION_TRANSITION_START, router)

    // Pop from off of tracker and makes sure it maintains state.
    const { to, from } = tracker

    await waitUntil(EventTypes.NAVIGATION_END, router)

    expect(from.params.thing).toEqual('one')
    expect(to.params.thing).toEqual('two')
  })
})

function waitUntil(evtType, router) {
  return when(() => router.currentEventType === evtType)
}
