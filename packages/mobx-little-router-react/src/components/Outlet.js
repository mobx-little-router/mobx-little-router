// @flow
import React, { createElement, Children, Component } from 'react'
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
      console.log("found activeNodes", activeNodes.length, activeNodes[1].value.data.component)
      return (
        <div>
          {createElement(activeNodes[1].value.data.component)}
        </div>
      )
    } else {
      return null
    }
  }
}

export default observer(Outlet)
