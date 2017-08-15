// @flow
import React, { Children, Component } from 'react'
import { RouterStore } from 'mobx-little-router'
import { RouterType } from './propTypes'

export default class RouterProvider extends Component {
  props: {
    module: {
      store: RouterStore,
      history: any
    },
    children?: React.Element<*>
  }

  static childContextTypes = {
    router: RouterType
  }

  getChildContext() {
    return {
      router: {
        store: this.props.module.store,
        history: this.props.module.history
      }
    }
  }

  render() {
    return Children.only(this.props.children)
  }
}