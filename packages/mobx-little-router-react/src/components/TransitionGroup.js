// @flow
import type { Route } from 'mobx-little-router'
import React, { createElement, Component } from 'react'
import { findDOMNode } from 'react-dom'
import { extendObservable, action, runInAction } from 'mobx'
import { observer } from 'mobx-react'

const classNames = {
  transitioning: 'transitioning',
  enter: 'enter',
  enterActive: 'enter-active',
  exit: 'exit',
  exitActive: 'exit-active',
}

type TransitionGroupProps = {
  from: ?Object,
  to: ?Object,
  isTransitioning: boolean,
  additionalProps: ?Object
}

class TransitionGroup extends Component<TransitionGroupProps> {
  innerRefs: Object = {}

  start = action(() => {
    const { to, from } = this.props
    const routes = [to, from]
    const afterCallbacks = []

    Object.keys(this.innerRefs).forEach(key => {
      const el = findDOMNode(this.innerRefs[key])
      const route = routes.find(route => route && route.key === key)

      if (route) {
        runInAction(() => {
          route.data.transitionState = route === to ? 'entering' : 'exiting'
        })

        if (el instanceof window.HTMLElement) {
          // Find element with data-transition-ref attribute to add transitionend event listener
          const target = el.querySelector('[data-transition-ref]')
          const inner = el.firstChild

          if (target) {
            const handleTransitionEnd = (ev) => {
              runInAction(() => {
                route.data.transitionState = route === to ? 'entered' : 'exited'
              })

              target.removeEventListener('transitionend', handleTransitionEnd)
            }

            target.addEventListener('transitionend', handleTransitionEnd, false)
          }

          afterCallbacks.push(() => {
            // Force repaint
            inner.scrollTop

            // Add ephemeral classname to trigger animation
            inner.classList.add(route === to ? classNames.enterActive : classNames.exitActive)
          })
        }
      }
    })

    afterCallbacks.forEach(cb => cb())
  })

  stop = action(() => {
    const { to } = this.props

    if (to) {
      to.data.transitionState = 'entered'
    }

    // Clear out refs
    this.innerRefs = {}
  })

  componentDidUpdate() {
    const { isTransitioning } = this.props

    if (isTransitioning) {
      this.start()
    } else {
      this.stop()
    }
  }

  render() {
    const { from, to, isTransitioning, additionalProps } = this.props
    const routes = []

    if (from) {
      routes.push({
        route: from,
        key: getKey(from),
        className: isTransitioning ? `${classNames.transitioning} ${classNames.exit}` : ''
      })
    }

    if (to) {
      routes.push({
        route: to,
        key: getKey(to),
        className: isTransitioning ? `${classNames.transitioning} ${classNames.enter}` : ''
      })
    }

    return (
      <div className="router-transition-group">
        {routes.map(({ route, key, className }) =>
          <TransitionItem
            key={key}
            route={route}
            className={className}
            additionalProps={additionalProps}
            innerRef={ref => this.innerRefs[route.key] = ref}
          />
        )}
      </div>
    )
  }
}

type TransitionItemProps = {
  route: Object,
  className: string,
  additionalProps: ?Object,
  innerRef: Function
}

// Need to wrap the item so we can properly set the innerRef
class TransitionItem extends Component<TransitionItemProps> {
  render() {
    const { route, className, additionalProps, innerRef } = this.props
    
    return (
      <div className="router-transition-item" data-route-key={route.key} ref={innerRef}>
        {createElement(route.data.component, {
          route,
          className,
          ...additionalProps
        })}
      </div>
    )
  }
}

const getKey = (route) => {
  if (typeof route.node.value.onTransition === 'function') {
    return route.key
  } else {
    return componentId(route.data.component)
  }
}

const componentId = (() => {
  let idx = 0
  return (component) => {
    return component.$$componentId || (component.$$componentId = `component:${++idx}`)
  }
})()

export default observer(TransitionGroup)