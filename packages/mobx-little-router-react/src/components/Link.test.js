// @flow
import React from 'react'
import { createRouter, mountInProvider } from '../testUtil'
import Link from './Link'

describe('Link', () => {
  let router

  beforeEach(() => {
    router = createRouter( [{ path: '', match: 'full'}, { path: 'foo' }])
    return router.start()
  })

  afterEach(() => {
    router.stop()
  })

  test('delegates to router to create href', () => {
    (router: any).createHref = jest.fn(() => '/whatever')

    const wrapper = mountInProvider(router)(
      <div>
        <Link className="index" to="/">Index</Link>
      </div>
    )

    expect(wrapper.html()).toMatch(/whatever/)
  })

  test('handles clicks', async () => {
    const wrapper = mountInProvider(router)(
      <div>
        <Link className="index" to="/">Index</Link>
        <Link className="foo" to="/foo">Foo</Link>
      </div>
    )

    wrapper.find('.foo').simulate('click', { button: 0 })
    await delay(0)

    expect(router._store.location.pathname).toEqual('/foo')

    wrapper.find('.index').simulate('click', { button: 0 })
    await delay(0)

    expect(router._store.location.pathname).toEqual('/')
  })

  test('supports target prop to skip router', async () => {
    const wrapper = mountInProvider(router)(
      <div>
        <Link target="_self" className="foo" to="/foo">Foo</Link>
      </div>
    )

    wrapper.find('.foo').simulate('click', { button: 0 })
    await delay(0)

    expect(router._store.location.pathname).toEqual('/')
  })

  test('supports onClick prop', async () => {
    const spy = jest.fn()
    const wrapper = mountInProvider(router)(
      <div>
        <Link onClick={spy} className="foo" to="/foo">Foo</Link>
      </div>
    )

    wrapper.find('.foo').simulate('click', { button: 0 })
    await delay(0)

    expect(spy).toHaveBeenCalled()
  })

  test('supports onMouseEnter prop', async () => {
    const spy = jest.fn()
    const wrapper = mountInProvider(router)(
      <div>
        <Link onMouseEnter={spy} className="foo" to="/foo">Foo</Link>
      </div>
    )

    wrapper.find('.foo').simulate('mouseenter')
    await delay(0)

    expect(spy).toHaveBeenCalled()
  })

  test('supports onMouseLeave prop', async () => {
    const spy = jest.fn()
    const wrapper = mountInProvider(router)(
      <div>
        <Link onMouseLeave={spy} className="foo" to="/foo">Foo</Link>
      </div>
    )

    wrapper.find('.foo').simulate('mouseleave')
    await delay(0)

    expect(spy).toHaveBeenCalled()
  })

  test('supports Location objects', async () => {
    const location = {
      pathname: '/foo',
      hash: '#hey',
      query: {
        a: 1,
        b: 2
      }
    }
    const spy = jest.fn()
    const wrapper = mountInProvider(router)(
      <div>
        <Link onClick={spy} className="foo" to={location}>Foo</Link>
      </div>
    )

    wrapper.find('.foo').simulate('click', { button: 0 })
    await delay(0)

    expect(spy).toHaveBeenCalled()
    expect(router._store.location.pathname).toEqual('/foo')
    expect(router._store.location.hash).toEqual('#hey')
    expect(router._store.location.query).toEqual({ a: '1', b: '2' })
    expect(router._store.location.search).toEqual('?a=1&b=2')
  })

  test('supports Location objects with state', async () => {
    const afterSpy = jest.fn()

    const location = {
      pathname: '/foo',
      state: {
        scrollTo: {
          x: 0,
          y: 50
        },
        after: function() {
          afterSpy()
          return this.scrollTo.y
        }
      }
    }
    const spy = jest.fn()
    const wrapper = mountInProvider(router)(
      <div>
        <Link onClick={spy} className="foo" to={location}>Foo</Link>
      </div>
    )

    wrapper.find('.foo').simulate('click', { button: 0 })
    await delay(0)

    expect(spy).toHaveBeenCalled()
    expect(router._store.location.pathname).toEqual('/foo')

    const state = router._store.location.state || {}

    expect(state.scrollTo).toEqual({ x: 0, y: 50 })
    expect(state.after()).toEqual(50)
    expect(afterSpy).toHaveBeenCalled()
  })
})

function delay(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms)
  })
}
