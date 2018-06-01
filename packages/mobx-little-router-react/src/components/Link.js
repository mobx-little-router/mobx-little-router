// @flow
import React, { Component } from 'react'
import type { Element } from 'react'
import { observer } from 'mobx-react'
import type { Router, LocationShape } from 'mobx-little-router'
import cx from 'classnames'
import qs from 'querystring'
import { assertRouterExists } from '../util'
import withRouter from '../hoc/withRouter'

type Props =  {
  to: string | LocationShape,
  className?: string,
  activeClassName?: string,
  style?: Object,
  children?: Element<*>,
  exact?: boolean,
  target?: string,
  onClick: Function,
  router: Router
}

class Link extends Component<Props> {
  onClick = (evt: MouseEvent) => {
    const { to, target, onClick, router } = this.props
    onClick && onClick(evt)

    // Taken from react-router to match their Link logic
    if (
      !evt.defaultPrevented && // onClick prevented default
      evt.button === 0 && // ignore everything but left clicks
      target == null && // let browser handle "target=_blank" etc.
      !isModifiedEvent(evt) // ignore clicks with modifier keys
    ) {
      evt.preventDefault()
      router.push(to)
    }
  }

  render() {
    const { router } = this.props

    // Mark for non-production build only.
    if (process && process.env.NODE_ENV !== 'production') {
      assertRouterExists(router)
    }
    const { to, className, activeClassName, style, children, exact, onClick, ...rest } = this.props
    const href = typeof to === 'object'
      ? locationToHref(to)
      : to

    const matchPrefix = '^'
    const matchSuffix = '/?' + (exact === true ? '$' : '')
    const matcher = new RegExp(`${matchPrefix}${typeof href === 'string' ? href.replace(/(\?.*)?$/, '') : ''}${matchSuffix}`)
    const isActive = matcher.test(router.location.pathname)

    return <a href={href != null ? router.createHref(href) : null} className={cx(className, typeof activeClassName ==='string' && { [activeClassName]: isActive })} style={style} onClick={this.onClick} {...rest}>{children}</a>
  }
}

const locationToHref = (location: LocationShape) => {
  const queryString = qs.stringify(location.query)
  const hash = location.hash || ''
  const search = (queryString ? `?${queryString}` : location.search) || ''

  return `${location.pathname}${hash}${search}`
}

const isModifiedEvent = (event: MouseEvent) => !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)

export default withRouter(observer(Link))
