// @flow
import type { Router } from 'mobx-little-router'
import React, { Component } from 'react'
import type { ComponentType } from 'react'
import { RouterType } from '../propTypes'
import { assertRouterExists } from '../util'
//import hoistNonReactStatics from 'hoist-non-react-statics'
const hoistNonReactStatics = require('hoist-non-react-statics')

export default function withRouter<T: Object>(
  Source: ComponentType<{ router: Router } & T>
): ComponentType<T> {
  class Wrapped extends Component<*> {
    static contextTypes = {
      router: RouterType
    }

    render() {
      assertRouterExists(this.context.router)
      return <Source router={this.context.router} {...this.props} />
    }
  }

  return hoistNonReactStatics(Wrapped, Source)
}
