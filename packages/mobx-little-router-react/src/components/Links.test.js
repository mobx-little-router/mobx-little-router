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

  test('Handles clicks', async () => {
    const wrapper = mountInProvider(router)(
      <div>
        <Link className="index" to="/">Index</Link>
        <Link className="foo" to="/foo">Foo</Link>
      </div>
    )

    wrapper.find('.foo').simulate('click')
    await delay(0)

    expect(router.store.location.pathname).toEqual('/foo/')

    wrapper.find('.index').simulate('click')
    await delay(0)
    
    expect(router.store.location.pathname).toEqual('/')
  })

  it('Supports reload prop to skip router', async () => {
    const wrapper = mountInProvider(router)(
      <div>
        <Link reload className="foo" to="/foo">Foo</Link>
      </div>
    )

    wrapper.find('.foo').simulate('click')
    await delay(0)

    expect(router.store.location.pathname).toEqual('/')
  })
})

function delay(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms)
  })
}
