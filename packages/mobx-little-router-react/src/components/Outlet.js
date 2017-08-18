// @flow
import React, { createElement, Children, Component } from 'react'
import withRouter from '../hoc/withRouter'
import { observer } from 'mobx-react'
import { Router } from 'mobx-little-router'
import { OutletType, RouterType } from '../propTypes'

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
        nodes: this.getNodes(),
        currentIndex: this.getCurrentIndex() + 1
      }
    }
  }

  // Filter out only active nodes that provide a component.
  getNodes() {
    return typeof this.context.outlet === 'undefined'
      ? this.props.router.store.nodes.filter(x => {
        return typeof x.value.data.component !== 'undefined'
      })
      : this.context.outlet.nodes
  }

  getCurrentIndex() {
    return typeof this.context.outlet === 'undefined'
      ? 0
      : this.context.outlet.currentIndex
  }

  render() {
    const idx = this.getCurrentIndex()
    const nodes = this.getNodes()
    const node = nodes[idx]

    // Did we match?
    if (node) {
      const { params, data } = node.value
      const { component } = data
      return createElement(component, { params })
    } else {
      return null
    }
  }
}

export default withRouter(observer(Outlet))
