// @flow
import React, { Component } from 'react'
import type { Element } from 'react'
import type { Router } from 'mobx-little-router'
import { RouterType } from '../propTypes'

type Props = {
  router: Router,
  children?: Element<*>
}

export default class RouterProvider extends Component<Props> {
  static childContextTypes = {
    router: RouterType
  }

  getChildContext() {
    return {
      router: this.props.router
    }
  }

  render() {
    return React.Children.only(this.props.children)
  }
}