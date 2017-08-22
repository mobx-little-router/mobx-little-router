// @flow
import React, { createElement, Component } from 'react'
import { extendObservable, action } from 'mobx'
import { observer } from 'mobx-react'

class TransitionGroup extends Component {
  props: {
    from: ?Object,
    to: ?Object,
    isTransitioning: boolean
  }

  constructor(props) {
    super(props)

    extendObservable(this, {
      transitionState: 'stopped'
    })
  }

  start = action(() => {
    this.transitionState = 'started'
  })

  stop = action(() => {
    this.transitionState = 'stopped'
  })

  componentWillUpdate(props) {
    const { isTransitioning, idx } = props
    if (idx === 1) {
      console.log("- Component will update", isTransitioning, this.transitionState)
    }

    if (isTransitioning && this.transitionState === 'stopped') {
      setTimeout(() => {
        console.log("-- starting transition")
        this.start()
      }, 100)
    } else if (!isTransitioning && this.transitionState === 'started') {
      console.log("-- reseting transition")
      this.stop()
    }
  }

  render() {
    const { from, to, isTransitioning, idx } = this.props
    const nodes = []

    let fromClassName, toClassName
    if (isTransitioning) {
      fromClassName = toClassName = 'transitioning'

      if (from) {
        fromClassName += ' leaving'
      }
      if (to) {
        toClassName += ' entering'
      }

      if (this.transitionState === 'started') {
        from && (fromClassName += ' leave')
        to && (toClassName += ' enter')
      }
    }

    if (from && isTransitioning) {
      nodes.push({ node: from, className: fromClassName })
    }
    if (to) {
      nodes.push({ node: to, className: toClassName })
    }

    if (idx === 1) {
      console.log(`- Rendering`, fromClassName, toClassName)
    }

    return (
      <div className="transition-group">
        {nodes.map(({ node, className }) =>
          createElement(node.value.data.component, { key: node.value.key, params: node.value.params, className })
        )}
      </div>
    )
  }
}

export default observer(TransitionGroup)