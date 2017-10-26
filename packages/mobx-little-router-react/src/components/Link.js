// @flow
import React, { Component } from 'react'
import type { Element } from 'react'
import { observer } from 'mobx-react'
import type { LocationShape } from 'mobx-little-router'
import { RouterType } from '../propTypes'
import cx from 'classnames'
import qs from 'querystring'

type Props =  {
  to: string | LocationShape,
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
    this.context.router.push(to)

    onClick && onClick(evt)
  }

  render() {
    const { router } = this.context
    const { to, className, activeClassName, style, children, exact, reload, onClick, ...rest } = this.props
    const href = typeof to === 'object'
      ? locationToHref(to)
      : to

    const matchPrefix = '^'
    const matchSuffix = '/?' + (exact === true ? '$' : '')
    const matcher = new RegExp(`${matchPrefix}${typeof href === 'string' ? href.replace(/(\?.*)?$/, '') : ''}${matchSuffix}`)
    const isActive = matcher.test(this.context.router._store.location.pathname)

    return <a href={router.createHref(href)} className={cx(className, typeof activeClassName ==='string' && { [activeClassName]: isActive })} style={style} onClick={this.onClick} {...rest}>{children}</a>
  }
}

const locationToHref = (location: LocationShape) => {
  const queryString = qs.stringify(location.query)
  const hash = location.hash || ''
  const search = (queryString ? `?${queryString}` : location.search) || ''

  return `${location.pathname}${hash}${search}`
}

export default observer(Link)
