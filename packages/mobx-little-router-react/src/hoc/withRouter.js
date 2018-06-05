// @flow
import type { Router } from 'mobx-little-router'
import React, { Component } from 'react'
import type { ComponentType } from 'react'
import { assertRouterExists } from '../util'
import { Consumer } from '../routerContext'
//import hoistNonReactStatics from 'hoist-non-react-statics'
const hoistNonReactStatics = require('hoist-non-react-statics')

export default function withRouter<T: Object>(
  Source: ComponentType<{ router: Router } & T>
): ComponentType<T> {
  class Wrapped extends Component<*> {
    render() {
      return (
        <Consumer>
          { router => {
              assertRouterExists(router)
              return <Source router={router} {...this.props} />
            }
          }
        </Consumer>
      )
    }
  }

  return hoistNonReactStatics(Wrapped, Source)
}
