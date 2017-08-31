// @flow
import React, { Component } from 'react'
import withRouter from '../hoc/withRouter'
import { observer } from 'mobx-react'
import { Router, areRoutesEqual } from 'mobx-little-router'
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

  getCurrentIndex() {
    return typeof this.context.outlet !== 'undefined'
      ? this.context.outlet.currentIndex
      : 0
  }

  findNode(nodes) {
    const { name } = this.props
    const idx = this.getCurrentIndex()

    if (typeof name === 'string') {
      return nodes.slice().reverse().find(node => node.data.outlet === name)
    } else {
      return nodes.filter(node => !node.data.outlet)[idx]
    }
  }

  render() {
    const { router, name } = this.props
    const idx = this.getCurrentIndex()

    const currNodes = filterNodes(router.store.nodes)
    const prevNodes = filterNodes(router.store.prevNodes)

    const to = this.findNode(currNodes)
    const from = this.findNode(prevNodes)

    const isTransitioning = !!prevNodes.length && !areRoutesEqual(to, from)

    const dataProps = {
      'data-depth': idx,
      'data-name': name
    }

    return (
      <div className={`outlet`} {...dataProps}>
        <TransitionGroup to={to} from={from} isTransitioning={isTransitioning} />
      </div>
    )
  }
}

const filterNodes = (nodes) => nodes.filter(node => node.data.component)

export default withRouter(observer(Outlet))
