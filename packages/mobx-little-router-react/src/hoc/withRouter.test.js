// @flow
import React from 'react'
import { createRouteStateTreeNoder, renderInProvider } from '../testUtil'
import withRouter from './withRouter'

describe('withRouter', () => {
  test('Provides router instance on props', () => {
    const router = createRouteStateTreeNoder([])
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
