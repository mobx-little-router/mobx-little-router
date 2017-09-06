// @flow
import React from 'react'
import { createRouter, renderInProvider } from '../testUtil'
import withRouter from './withRouter'

describe('withRouter', () => {
  test('Provides router instance on props', () => {
    const router = createRouter([])
    let _router = null

    const MyComponent = ({ router }: any) => {
      _router = router
      return null
    }

    const MyComponentWithRouter = withRouter(MyComponent)

    renderInProvider(router)(<MyComponentWithRouter />)

    expect(_router).toBe(router)
  })
})
