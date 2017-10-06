// @flow
import React from 'react'
import { Router } from 'mobx-little-router'
import { createRouter, renderInProvider } from '../testUtil'
import withRouter from './withRouter'

describe('withRouter', () => {
  test('Provides router instance on props', () => {
    const router = createRouter([])
    let _router = null

    type Props = {
      router: Router,
      x: number
    }
    const MyComponent = ({ router }: Props) => {
      _router = router
      return null
    }
    MyComponent.somethingStatic = {}

    const MyComponentWithRouter = withRouter(MyComponent)

    renderInProvider(router)(<MyComponentWithRouter x={1}/>)

    expect(_router).toBe(router)
    expect((MyComponentWithRouter: any).somethingStatic).toEqual(MyComponent.somethingStatic)
  })
})
