// @flow
import React from 'react'
import { mount } from 'enzyme'
import { createMemoryHistory } from 'history'
import { install } from 'mobx-little-router'
import RouterProvider from './RouterProvider'
import Link from './Link'

describe('Link', () => {
  let router

  beforeEach((done) => {
    router = install({
      createHistory: createMemoryHistory,
      routes: [{ path: '' }, { path: 'foo' }]
    })
    router.start(done)
  })

  afterEach(() => {
    router.stop()
  })

  test('it handles clicks', async () => {
    const wrapper = mount(
      <RouterProvider router={router}>
        <div>
          <Link className="index" to="/">Index</Link>
          <Link className="foo" to="/foo">Foo</Link>
        </div>
      </RouterProvider>
    )

    wrapper.find('.foo').simulate('click')
    await delay(0)

    expect(router.store.location && router.store.location.pathname).toEqual('/foo/')

    wrapper.find('.index').simulate('click')
    await delay(0)
    
    expect(router.store.location && router.store.location.pathname).toEqual('/')
  })
})

function delay(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms)
  })
}
