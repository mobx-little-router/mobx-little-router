// @flow
import React, { Component } from 'react'
import { observer } from 'mobx-react'
import type { Location } from 'mobx-little-router'
import { RouterType } from './propTypes'
import cx from 'classnames'

class Link extends Component {
  static contextTypes = {
    router: RouterType
  }

  props: {
    to: string,
    className?: string,
    activeClassName?: string,
    style?: Object,
    children?: React.Element<*>,
    exact?: boolean
  }

  onClick = (evt: Event) => {
    evt.preventDefault()
    this.context.router.history.push(this.props.to)
  }

  render() {
    const { to, className, activeClassName, style, children, exact } = this.props
    const matchPrefix = '^'
    const matchSuffix = '/?' + (exact ? '$' : '')
    const matcher = new RegExp(`${matchPrefix}${to}${matchSuffix}`)
    const isActive = matcher.test(this.context.router.store.location.pathname)

    return <a href={to} className={cx(className, activeClassName && { [activeClassName]: isActive })} style={style} onClick={this.onClick}>{children}</a>
  }
}

export default observer(Link)
