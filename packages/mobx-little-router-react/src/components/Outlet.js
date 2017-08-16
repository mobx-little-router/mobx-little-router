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
    const components = activeNodes.map(node => node.value.data && node.value.data.component).filter(Boolean)

    if (components.length) {
      return renderComponentTree(components)
    } else {
      return null
    }
  }
}

const renderComponentTree = (components) => {
  return components.reduceRight((children, component) => {
    return createElement(component, {}, children)
  }, undefined)
}

export default observer(Outlet)
