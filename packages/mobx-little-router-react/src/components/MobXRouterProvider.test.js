// @flow
import React from 'react'
import { shallow } from 'enzyme'
import { createMemoryHistory } from 'history'
import { install } from 'mobx-little-router'
import MobXRouterProvider from './MobXRouterProvider'

describe('MobXRouterProvider', () => {
  let module

  beforeEach(() => {
    module = install({
      createHistory: createMemoryHistory,
      routes: [{ path: '' }]
    })
  })

  test('it renders', () => {
    const wrapper = shallow(
      <MobXRouterProvider module={module}><div>Hello!</div></MobXRouterProvider>
    )

    expect(wrapper.text()).toEqual('Hello!')
  })
})
