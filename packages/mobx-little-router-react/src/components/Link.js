// @flow
import React, { Component } from 'react'
import type { Element } from 'react'
import { observer } from 'mobx-react'
import type { LocationShape } from 'mobx-little-router'
import { RouterType } from '../propTypes'
import cx from 'classnames'
import qs from 'querystring'
import renderer from 'react-test-renderer'

type Props =  {
  to: string | LocationShape,
  className?: string,
  activeClassName?: string,
  style?: Object,
  children?: Element<*>,
  exact?: boolean,
  target?: string,
  onClick: Function
}

class Link extends Component<Props> {
  static contextTypes = {
    router: RouterType
  }

  onClick = (evt: MouseEvent) => {
    const { to, target, onClick } = this.props
    onClick && onClick(evt)

    // Taken from react-router to match their Link logic
    if (
      !evt.defaultPrevented && // onClick prevented default
      evt.button === 0 && // ignore everything but left clicks
      target == null && // let browser handle "target=_blank" etc.
      !isModifiedEvent(evt) // ignore clicks with modifier keys
    ) {
      evt.preventDefault()
      this.context.router.push(to)
    }
  }

  render() {
    const { router } = this.context
    // Mark for non-production build only.
    if (process && process.env.NODE_ENV !== 'production') {
      assertExists(router)
    }
    const { to, className, activeClassName, style, children, exact, onClick, ...rest } = this.props
    const href = typeof to === 'object'
      ? locationToHref(to)
      : to

    const matchPrefix = '^'
    const matchSuffix = '/?' + (exact === true ? '$' : '')
    const matcher = new RegExp(`${matchPrefix}${typeof href === 'string' ? href.replace(/(\?.*)?$/, '') : ''}${matchSuffix}`)
    const isActive = matcher.test(this.context.router.location.pathname)

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

export default observer(Link)

function assertExists(router) {
  if (router) {
    return
  }
  if (process && process.env.NODE_ENV === 'test') {
    throw new Error(`<Link/> component was rendered without <RouterProvider/>. See: https://github.com/mobx-little-router/mobx-little-router#quick-start

You can fix it by rendering as follows:

\`\`\`
import React from 'react'
import renderer from 'react-test-renderer'
import { install, Link, RouterProvider } from 'mobx-little-router-react'
import { createMemoryHistory } from 'history'
const router = install({
  history: createMemoryHistory(),
  routes: [{ path: '/foo' }]
})
renderer.create(
  <RouterProvider router={router}>
    <Link to="/foo">Go to Foo</Link>
  </RouterProvider>
)
\`\`\`
`)
  } else {
    throw new Error(`<Link/> component was rendered without <RouterProvider/>. See: https://github.com/mobx-little-router/mobx-little-router#quick-start`)
  }
}
