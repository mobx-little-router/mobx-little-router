// @flow
import React from 'react'
import { shallow } from 'enzyme'
import { createMemoryHistory } from 'history'
import { install } from 'mobx-little-router'
import RouterProvider from './RouterProvider'

describe('RouterProvider', () => {
  let module

  beforeEach(() => {
    module = install({
      createHistory: createMemoryHistory,
      routes: [{ path: '' }]
    })
  })

  test('it renders', () => {
    const wrapper = shallow(
      <RouterProvider module={module}><div>Hello!</div></RouterProvider>
    )

    expect(wrapper.text()).toEqual('Hello!')
  })
})
