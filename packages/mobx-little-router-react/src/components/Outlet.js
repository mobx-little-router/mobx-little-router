// @flow
import React, { Component } from 'react'
import withRouter from '../hoc/withRouter'
import { observer } from 'mobx-react'
import { Router } from 'mobx-little-router'
import { OutletType, RouterType } from '../propTypes'

import TransitionGroup from './TransitionGroup'

/*
 * Outlet component is responsible for rendering the matched components
 * from RouterStore into it. Each Outlet element renders it's current node index
 * in the path, and then provides the next index to subsequent Outlet components.
 */

type OutletProps = {
  // The name will allow us to potentially render to different outlets
  // throughout the app. e.g. sidebar vs main
  name?: string,
  router: Router
}

class Outlet extends Component {
  static contextTypes = {
    // We may have another outlet above us in the context.
    outlet: OutletType
  }

  static childContextTypes = {
    outlet: OutletType
  }

  props: OutletProps

  getChildContext() {
    return {
      outlet: {
        currentIndex: this.getCurrentIndex() + 1
      }
    }
  }

  // Filter out only active nodes that provide a component.
  getNodes() {
    return this.props.router.store.nodes.filter(x => {
      return typeof x.value.data.component !== 'undefined'
    })
  }

  getPrevNodes() {
    return this.props.router.store.prevNodes.filter(x => {
      return typeof x.value.data.component !== 'undefined'
    })
  }

  getCurrentIndex() {
    return typeof this.context.outlet !== 'undefined'
      ? this.context.outlet.currentIndex
      : 0
  }

  render() {
    const idx = this.getCurrentIndex()
    const nodes = this.getNodes()
    const node = nodes[idx]

    const prevNodes = this.getPrevNodes()
    const prevNode = prevNodes[idx]

    const isTransitioning = !!(prevNodes.length && node !== prevNode)
    
    return (
      <div className={`outlet outlet-depth-${idx}`}>
        <TransitionGroup from={prevNode} to={node} isTransitioning={isTransitioning} idx={idx} />
      </div>
    )
  }
}

export default withRouter(observer(Outlet))
