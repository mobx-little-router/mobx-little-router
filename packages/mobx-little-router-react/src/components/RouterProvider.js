// @flow
import React, { Component } from 'react'
import type { Element } from 'react'
import type { Router } from 'mobx-little-router'
import { RouterType } from '../propTypes'
import { Provider } from '../routerContext'

type Props = {
  router: Router,
  children?: Element<*>
}

export default class RouterProvider extends Component<Props> {
  static propTypes = {
    router: RouterType
  }

  render() {
    return (
      <Provider value={this.props.router}>
        {React.Children.only(this.props.children)}
      </Provider>
    )
  }
}
