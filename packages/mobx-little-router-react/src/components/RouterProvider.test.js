// @flow
import React from 'react'
import { shallow } from 'enzyme'
import { createMemoryHistory } from 'history'
import { install } from 'mobx-little-router'
import RouterProvider from './RouterProvider'

describe('RouterProvider', () => {
  let router

  beforeEach(() => {
    router = install({
      createHistory: createMemoryHistory,
      routes: [{ path: '' }]
    })
  })

  test('it renders child', () => {
    const wrapper = shallow(
      <RouterProvider router={router}>
        <div>Hello!</div>
      </RouterProvider>
    )

    expect(wrapper.text()).toEqual('Hello!')
  })
})
