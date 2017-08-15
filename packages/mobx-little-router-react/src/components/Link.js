// @flow
import React, { Component } from 'react'
import { observer } from 'mobx-react'
import type { Location } from 'mobx-little-router'
import { RouterType } from './propTypes'

class Link extends Component {
  static contextTypes = {
    router: RouterType
  }

  props: {
    to: string,
    children: React.Element<*>
  }

  onClick() {
    this.context.router.history.push(this.props.to)
  }

  render() {
    return <a onClick={this.onClick}>{this.props.children}</a>
  }
}

export default observer(Link)
