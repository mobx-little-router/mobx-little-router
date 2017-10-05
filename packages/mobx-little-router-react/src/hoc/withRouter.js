// @flow
import type { Router } from 'mobx-little-router'
import React, { Component } from 'react'
import type { ComponentType } from 'react'
import { RouterType } from '../propTypes'

export default function withRouter<T>(
  Cmp: ComponentType<{ router: Router } & T>
): ComponentType<T> {
  class Wrapped extends Component<*> {
    static contextTypes = {
      router: RouterType
    }

    render() {
      return <Cmp router={this.context.router} {...this.props} />
    }
  }

  return Wrapped
}
