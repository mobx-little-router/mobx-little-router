// @flow
import type { Router } from 'mobx-little-router'
import React, { Component } from 'react'
import type { ComponentType } from 'react'
import RouterContext from '../contexts/RouterContext'
import { assertRouterExists } from '../util'
import hoistNonReactStatics from 'hoist-non-react-statics'

export default function withRouter<T: Object>(
  Source: ComponentType<{ router: Router } & T>
): ComponentType<T> {
  class Wrapped extends Component<*> {
    render() {
      return (
        <RouterContext.Consumer>
          {router => {
            assertRouterExists(router)
            return <Source router={router} {...this.props} />
          }}
        </RouterContext.Consumer>
      )
    }
  }

  return hoistNonReactStatics(Wrapped, Source)
}
