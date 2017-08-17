// @flow
import React from 'react'
import { render } from 'enzyme'
import withRouter from './withRouter'
import { createMemoryHistory } from 'history'
import RouterProvider from '../components/RouterProvider'
import { install } from 'mobx-little-router'

describe('withRouter', () => {
  let router

  beforeEach(() => {
    router = install({
      createHistory: createMemoryHistory,
      routes: []
    })
  })

  test('Provides router instance on props', () => {
    let _router = null
    const MyComponent = ({ router }: any) => {
      _router = router
      return <div/>
    }

    const MyComponentWithRouter = withRouter(MyComponent)

    render(
      <RouterProvider router={router}>
        <MyComponentWithRouter/>
      </RouterProvider>)

    expect(_router).toBe(router)
  })
})