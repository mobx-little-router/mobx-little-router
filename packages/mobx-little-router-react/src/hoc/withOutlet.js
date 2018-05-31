// @flow
import type { Router } from 'mobx-little-router'
import React, { Component } from 'react'
import type { ComponentType } from 'react'
import { OutletType } from '../propTypes'
import OutletContext from '../contexts/OutletContext'
//import hoistNonReactStatics from 'hoist-non-react-statics'
const hoistNonReactStatics = require('hoist-non-react-statics')

export default function withOutlet<T: Object>(
  Source: ComponentType<{ outlet: OutletType } & T>
): ComponentType<T> {
  class Wrapped extends Component<*> {
    render() {
      return (
        <OutletContext.Consumer>
          {outlet => {
            return <Source outlet={outlet} {...this.props} />
          }}
        </OutletContext.Consumer>
      )
    }
  }

  return hoistNonReactStatics(Wrapped, Source)
}
