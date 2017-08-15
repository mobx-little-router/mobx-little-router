// @flow
import React, { Children, Component } from 'react'
import { RouterStore } from 'mobx-router'
import PropTypes from 'prop-types'

export default class MobXRouterProvider extends Component {
  props: {
    module: {
      store: RouterStore,
      history: any
    },
    children?: React.Element<*>
  }

  static childContextTypes = {
    router: PropTypes.shape({
      store: PropTypes.object,
      history: PropTypes.object
    })

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