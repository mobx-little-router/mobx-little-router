// @flow
import React from 'react'
import { createRouter, delay } from '../testUtil'
import { mount } from 'enzyme'
import { when } from 'mobx'
import RoutedComponentTracker from '../util/RoutedComponentsTracker'
import TransitionGroup, { TransitionItem } from './TransitionGroup'
import { areRoutesEqual, EventTypes } from 'mobx-little-router'

describe('TransitionGroup', () => {
  let router
  let tracker

  const updateRoutes = wrapper => {
    const props = { to: tracker.to, from: tracker.from, isTransitioning: tracker.isTransitioning }
    wrapper.setProps(props)
  }

  const hasClass = (el, className) => {
    return el.html().indexOf(className) >= 0
  }

  beforeEach(() => {
    router = createRouter(
      [
        {
          path: 'about',
          getData: () => ({ component: AboutPage }),
          onTransition: () => {
            return delay(100)
          }
        },
        {
          path: 'contact',
          getData: () => ({ component: ContactPage }),
          onTransition: () => {
            return delay(100)
          }
        }
      ],
      '/'
    )
    tracker = new RoutedComponentTracker(router, undefined, 0)
    router.start()
    tracker.start()
  })

  afterEach(() => {
    tracker.stop()
    router.stop()
  })

  test('TransitionGroup initial state is empty', async () => {
    const wrapper = mount(<TransitionGroup isTransitioning={false} />)
    expect(wrapper.find(TransitionItem).length).toBe(0)
  })

  test('TransitionGroup has TransitionItem after route change', async () => {
    const wrapper = mount(<TransitionGroup isTransitioning={false} />)

    router.push('/about')
    await delay(0)
    updateRoutes(wrapper)

    expect(wrapper.find(TransitionItem).length).toBe(1)
  })

  // XXX note that classList mutations are no longer picked up by enzyme
  // We need to mutate the classlist in this fashion to trigger the animation in the most
  // efficient way possible. The hasClass helper uses enzymes .html() function to view the raw html
  // we use this to check the animation lifecycle classes are correctly applied.
  test('TransitionGroup handles transitioning in and out of routes', async () => {
    const wrapper = mount(<TransitionGroup isTransitioning={false} />)

    router.push('/about')
    await waitUntil(EventTypes.NAVIGATION_TRANSITION_START, router)
    updateRoutes(wrapper)

    // Initially we should be transitioning and have the enter class
    expect(wrapper.find(TransitionItem).hasClass('transitioning')).toBe(true)
    expect(wrapper.find(TransitionItem).hasClass('enter')).toBe(true)

    // Then the animation is initialized with the active class
    expect(tracker.to && tracker.to.data.transitionState).toBe('entering')
    //XXX expect(wrapper.find(TransitionItem).hasClass('enter-active')).toBe(true)
    expect(hasClass(wrapper.find(TransitionItem).at(0), 'enter-active')).toBe(true)

    // Wait for transition to complete
    await delay(150)
    updateRoutes(wrapper)

    // Our transition has settled and transitioning class removed
    expect(wrapper.childAt(0).childAt(0).hasClass('transitioning')).toBe(false)
    expect(wrapper.childAt(0).childAt(0).hasClass('enter-active')).toBe(false)
    expect(tracker.to && tracker.to.data.transitionState).toBe('entered')

    router.push('/contact')
    await waitUntil(EventTypes.NAVIGATION_TRANSITION_START, router)
    updateRoutes(wrapper)

    // Now we will have two transitioning elements
    expect(wrapper.find(TransitionItem).length).toBe(2)
    expect(wrapper.find(TransitionItem).at(0).hasClass('transitioning')).toBe(true)
    expect(wrapper.find(TransitionItem).at(1).hasClass('transitioning')).toBe(true)
    expect(wrapper.find(TransitionItem).at(0).hasClass('exit')).toBe(true)
    expect(wrapper.find(TransitionItem).at(1).hasClass('enter')).toBe(true)

    await waitUntil(EventTypes.NAVIGATION_TRANSITION_END, router)

    // Then the animation is initialized with the active class
    expect(tracker.to && tracker.to.data.transitionState).toBe('entering')
    expect(tracker.from && tracker.from.data.transitionState).toBe('exiting')
    //XXX expect(wrapper.find(TransitionItem).at(0).hasClass('exit-active')).toBe(true)
    //XXX expect(wrapper.find(TransitionItem).at(1).hasClass('enter-active')).toBe(true)
    expect(hasClass(wrapper.find(TransitionItem).at(0), 'exit-active')).toBe(true)
    expect(hasClass(wrapper.find(TransitionItem).at(1), 'enter-active')).toBe(true)

    // Wait for the transition to complete
    await delay(150)
    updateRoutes(wrapper)

    // Our transition has settled and transitioning class removed
    expect(wrapper.find(TransitionItem).length).toBe(1)
    expect(wrapper.find(TransitionItem).hasClass('transitioning')).toBe(false)
  })
})

const AboutPage = ({ className }) => <div className={className}>AboutPage</div>
const ContactPage = ({ className }) => <div className={className}>ContactPage</div>

function waitUntil(evtType, router) {
  return new Promise(res => {
    when(() => router.currentEventType === evtType, res)
  })
}
