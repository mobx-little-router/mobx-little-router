// @flow
import React, { createElement, Children, Component } from 'react'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import { RouterStore } from 'mobx-little-router'
import { RouterType } from './propTypes'

class Outlet extends Component {
  static contextTypes = {
    router: RouterType
  }

  render() {
    const { activeNodes } = this.context.router.store

    if (activeNodes.length) {
      return renderComponentTree(activeNodes)
    } else {
      return null
    }
  }
}

const renderComponentTree = (nodes) => {
  return nodes.reduceRight((children, node) => {
    const { params, data } = node.value
    const { component } = data

    return component
      ? createElement(component, { params }, children)
      : children
  }, undefined)
}

export default observer(Outlet)
