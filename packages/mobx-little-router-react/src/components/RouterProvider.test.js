// @flow
import React from 'react'
import { renderInProvider } from '../testUtil'

describe('RouterProvider', () => {
  test('it renders child', () => {
    const wrapper = renderInProvider([])(
      <div>Hello!</div>
    )
    expect(wrapper.text()).toEqual('Hello!')
  })
})
