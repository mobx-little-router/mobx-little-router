// @flow
import type { Route } from 'mobx-little-router'
import React, { createElement, Component } from 'react'
import { findDOMNode } from 'react-dom'
import { extendObservable, action } from 'mobx'
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
    idx: number
  }

  transitionState: string
  innerRefs: Array<any> = []

  constructor(props) {
    super(props)

    extendObservable(this, {
      transitionState: 'stopped'
    })
  }

  start = action(() => {
    this.innerRefs.forEach(ref => {
      const el = findDOMNode(ref)

      if (el) {
        // Find element with data-transition-ref attribute to add transitionend event listener
        const target = el.parentElement.querySelector('[data-transition-ref]')
    
        if (target) {         
          const handleTransitionEnd = (ev) => {
            console.log("-------transition end--------", target)
            target.removeEventListener('transitionend', handleTransitionEnd)
          }

          target.addEventListener('transitionend', handleTransitionEnd, false)
        
          // Only start the transition if we find an element to transition
          this.transitionState = 'started'
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
    const { from, to, isTransitioning } = this.props
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

    console.log("- rendering transition group:")
    console.log("  - to:", to)
    console.log("  - from:", from)

    return (
      <div className="transition-group">
        {routes.map(({ route, className }, idx) =>
          createElement(route.data.component, {
            key: route.key,
            params: route.params,
            className,
            ref: (ref) => { this.innerRefs[idx] = ref }
          })
        )}
      </div>
    )
  }
}

export default observer(TransitionGroup)