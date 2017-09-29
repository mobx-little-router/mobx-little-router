// @flow
import type { Route } from 'mobx-little-router'
import React, { createElement, Component } from 'react'
import { findDOMNode } from 'react-dom'
import { extendObservable, action, runInAction } from 'mobx'
import { observer } from 'mobx-react'

const transitioningClassName = 'transitioning'

const classNames = {
  transitioning: 'transitioning',
  enter: 'enter',
  enterActive: 'enter-active',
  exit: 'exit',
  exitActive: 'exit-active',
}

class TransitionGroup extends Component {
  props: {
    from: ?Object,
    to: ?Object,
    isTransitioning: boolean,
    additionalProps: ?Object
  }

  transitionState: string
  innerRefs: Object = {}

  constructor(props) {
    super(props)

    extendObservable(this, {
      transitionState: 'stopped'
    })
  }

  start = action(() => {
    const { to, from } = this.props
    const routes = [to, from]

    Object.keys(this.innerRefs).forEach(key => {
      const el = findDOMNode(this.innerRefs[key])
      const route = routes.find(route => route && route.key === key)

      if (route) {
        runInAction(() => {
          route.data.transitionState = route === to ? 'entering' : 'exiting'
        })

        if (el instanceof window.HTMLElement) {
          // Find element with data-transition-ref attribute to add transitionend event listener
          const target = el.hasAttribute('data-transition-ref')
            ? el
            : el.querySelector('[data-transition-ref]')

          const finishTransition = () => {
            runInAction(() => {
              route.data.transitionState = route === to ? 'entered' : 'exited'
            })
          }

          if (target) {
            const handleTransitionEnd = (ev) => {
              finishTransition()

              target.removeEventListener('transitionend', handleTransitionEnd)
            }

            target.addEventListener('transitionend', handleTransitionEnd, false)
          }
        }
      }
    })

    this.transitionState = 'started'
  })

  stop = action(() => {
    const { to } = this.props

    if (to) {
      to.data.transitionState = 'entered'
    }

    // Clear out refs
    this.innerRefs = {}

    this.transitionState = 'stopped'
  })

  componentDidUpdate() {
    const { isTransitioning } = this.props

    if (isTransitioning && this.transitionState === 'stopped') {
      setTimeout(() => { this.start() })
    } else if (!isTransitioning && this.transitionState === 'started') {
      this.stop()
    }
  }

  render() {
    const { from, to, isTransitioning, additionalProps } = this.props
    const routes = []

    let fromClassName = ''
    let toClassName = ''

    if (isTransitioning) {
      if (from) {
        fromClassName = `${classNames.transitioning} ${classNames.exit}`
      }
      if (to) {
        toClassName = `${classNames.transitioning} ${classNames.enter}`
      }

      if (this.transitionState === 'started') {
        from && (fromClassName += ` ${classNames.exitActive}`)
        to && (toClassName += ` ${classNames.enterActive}`)
      }
    }

    if (from && isTransitioning) {
      routes.push({ route: from, className: fromClassName })
    }

    if (to) {
      routes.push({ route: to, className: toClassName })
    }

    return (
      <div className="transition-group">
        {routes.map(({ route, className }) =>
          createElement(route.data.component, {
            key: route.key,
            route,
            className,
            ...additionalProps,
            ref: (ref) => {
              this.innerRefs[route.key] = ref
            }
          })
        )}
      </div>
    )
  }
}

export default observer(TransitionGroup)