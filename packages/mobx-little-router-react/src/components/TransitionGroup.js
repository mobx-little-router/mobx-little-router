// @flow
import type { Route } from 'mobx-little-router'
import React, { createElement, Component } from 'react'
import { findDOMNode } from 'react-dom'
import { extendObservable, action, runInAction } from 'mobx'
import { observer } from 'mobx-react'

const transitioningClassName = 'transitioning'

const classNames = {
  transitioning: 'transitioning',
  entering: 'entering',
  leaving: 'leaving',
  enter: 'enter',
  leave: 'leave'
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

      if (el instanceof HTMLElement && route) {
        // Find element with data-transition-ref attribute to add transitionend event listener
        const target = el.hasAttribute('data-transition-ref')
          ? el
          : el.querySelector('[data-transition-ref]')
    
        if (target) {  
          const handleTransitionEnd = (ev) => {            
            runInAction(() => {
              route.data.transitionState = route === to ? 'entered' : 'exited'
            })

            target.removeEventListener('transitionend', handleTransitionEnd)
          }

          target.addEventListener('transitionend', handleTransitionEnd, false)
        
          runInAction(() => {
            route.data.transitionState = route === to ? 'entering' : 'exiting'
            this.transitionState = 'started'
          })
        }
      }
    })
  })

  stop = action(() => {
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
        fromClassName = `${classNames.transitioning} ${classNames.leaving}`
      }
      if (to) {
        toClassName = `${classNames.transitioning} ${classNames.entering}`
      }

      if (this.transitionState === 'started') {
        from && (fromClassName += ` ${classNames.leave}`)
        to && (toClassName += ` ${classNames.enter}`)
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
        {routes.map(({ route, className }, idx) =>
          createElement(route.data.component, {
            key: route.key,
            params: route.params,
            query: route.query,
            className,
            ...additionalProps,
            ref: (ref) => { this.innerRefs[route.key] = ref }
          })
        )}
      </div>
    )
  }
}

export default observer(TransitionGroup)