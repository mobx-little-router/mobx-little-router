// @flow
import React, { Children, Component } from 'react'
import { Router } from 'mobx-little-router'
import { RouterType } from '../propTypes'

export default class RouterProvider extends Component {
  props: {
    router: Router,
    children?: React.Element<*>
  }

  static childContextTypes = {
    router: RouterType
  }

  getChildContext() {
    return {
      router: this.props.router
    }
  }

  render() {
    return Children.only(this.props.children)
  }
}