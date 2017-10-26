// @flow
import React from 'react'
import { createRouter, delay } from '../testUtil'
import { mount } from 'enzyme'
import TransitionGroup from './TransitionGroup'
import { areRoutesEqual } from 'mobx-little-router'

describe('TransitionGroup', () => {
  let router
  
  const updateRoutes = (wrapper) => {
    let to, from
    if (router._store.routes.length > 1) { to = router._store.routes[1] }
    if (router._store.prevRoutes.length > 1) { from = router._store.prevRoutes[1] }

    const isTransitioning =
      router._store.prevRoutes.length > 0 &&
      !areRoutesEqual(to, from) &&
      (canTransition(to) || canTransition(from))

    wrapper.setProps({ to, from, isTransitioning })
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
    return router.start()
  })

  afterEach(() => {
    router.stop()
  })

  test('TransitionGroup handles transitioning in and out of routes', async () => {
    const wrapper = mount(<TransitionGroup isTransitioning={false} />)
    
    expect(wrapper.children().length).toBe(0)

    router.push('/about')
    await delay(0)
    updateRoutes(wrapper)

    // Initially we should be transitioning and have the enter class
    expect(wrapper.children().length).toBe(1)
    expect(wrapper.childAt(0).childAt(0).hasClass('transitioning')).toBe(true)  
    expect(wrapper.childAt(0).childAt(0).hasClass('enter')).toBe(true)
    
    await delay(0)

    // Then the animation is initialized with the active class
    expect(wrapper.childAt(0).childAt(0).hasClass('enter-active')).toBe(true)
    expect(router._store.routes[1].data.transitionState).toBe('entering')

    // Wait for transition to complete
    await delay(150)
    updateRoutes(wrapper)

    // Our transition has settled and transitioning class removed 
    expect(wrapper.childAt(0).childAt(0).hasClass('transitioning')).toBe(false)
    expect(wrapper.childAt(0).childAt(0).hasClass('enter-active')).toBe(false)
    expect(router._store.routes[1].data.transitionState).toBe('entered')

    router.push('/contact')
    await delay(0)
    updateRoutes(wrapper)

    // Now we will have two transitioning elements
    expect(wrapper.children().length).toBe(2)
    expect(wrapper.childAt(0).childAt(0).hasClass('transitioning')).toBe(true)
    expect(wrapper.childAt(1).childAt(0).hasClass('transitioning')).toBe(true)
    expect(wrapper.childAt(0).childAt(0).hasClass('exit')).toBe(true)
    expect(wrapper.childAt(1).childAt(0).hasClass('enter')).toBe(true)

    await delay(0)

    // Then the animation is initialized with the active class
    expect(wrapper.childAt(0).childAt(0).hasClass('exit-active')).toBe(true)
    expect(wrapper.childAt(1).childAt(0).hasClass('enter-active')).toBe(true)
    expect(router._store.routes[1].data.transitionState).toBe('entering')
    expect(router._store.prevRoutes[1].data.transitionState).toBe('exiting')

    // Wait for the transition to complete
    await delay(150)
    updateRoutes(wrapper)

    // Our transition has settled and transitioning class removed 
    expect(wrapper.children().length).toBe(1)
    expect(wrapper.childAt(0).childAt(0).hasClass('transitioning')).toBe(false)
  })
})

const AboutPage = ({ className }) => <div className={className}>AboutPage</div>
const ContactPage = ({ className }) => <div className={className}>ContactPage</div>

const canTransition = node => (node ? typeof node.onTransition === 'function' : false)
