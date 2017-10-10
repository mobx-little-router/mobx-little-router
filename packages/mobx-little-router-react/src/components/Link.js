// @flow
import React, { Component } from 'react'
import type { Element } from 'react'
import { observer } from 'mobx-react'
import type { Location } from 'mobx-little-router'
import { RouterType } from '../propTypes'
import cx from 'classnames'

type Props =  {
  to: string | Location,
  className?: string,
  activeClassName?: string,
  style?: Object,
  children?: Element<*>,
  exact?: boolean,
  reload?: boolean,
  onClick: Function
}

class Link extends Component<Props> {
  static contextTypes = {
    router: RouterType
  }

  onClick = (evt: Event) => {
    const { to, reload, onClick } = this.props

    if (reload === true) {
      return
    }

    evt.preventDefault()
    this.context.router.history.push(to)

    onClick && onClick(evt)
  }

  render() {
    const { to, className, activeClassName, style, children, exact } = this.props
    const matchPrefix = '^'
    const matchSuffix = '/?' + (exact === true ? '$' : '')
    const matcher = new RegExp(`${matchPrefix}${to}${matchSuffix}`)
    const isActive = matcher.test(this.context.router.store.location.pathname)

    const href = typeof to === 'object'
      ? to.pathname
      : to

    return <a href={href} className={cx(className, typeof activeClassName ==='string' && { [activeClassName]: isActive })} style={style} onClick={this.onClick}>{children}</a>
  }
}

export default observer(Link)
