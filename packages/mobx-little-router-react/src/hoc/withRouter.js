// @flow
import type { Router } from 'mobx-little-router'
import React, { Component } from 'react'
import type { ComponentType } from 'react'
import hoistStatics from 'hoist-non-react-statics'
import { RouterType } from '../propTypes'

export default function withRouter<T: Object>(
  Source: ComponentType<{ router: Router } & T>
): ComponentType<T> {
  class Wrapped extends Component<*> {
    static contextTypes = {
      router: RouterType
    }

    render() {
      return <Source router={this.context.router} {...this.props} />
    }
  }

  return hoistStatics(Wrapped, Source)
}
