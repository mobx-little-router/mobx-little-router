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
    className?: string,
    style?: Object,
    children?: React.Element<*>
  }

  onClick = (evt: Event) => {
    evt.preventDefault()
    this.context.router.history.push(this.props.to)
  }

  render() {
    const { to, className, style, children } = this.props
    return <a href={to} className={className} style={style} onClick={this.onClick}>{children}</a>
  }
}

export default observer(Link)
