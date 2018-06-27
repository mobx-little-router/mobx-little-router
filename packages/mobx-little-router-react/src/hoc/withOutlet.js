// @flow
import React, { Component } from 'react'
import type { ComponentType } from 'react'
import OutletContext, { type OutletContextValue } from '../contexts/OutletContext'
import hoistNonReactStatics from 'hoist-non-react-statics'

export default function withOutlet<T: Object>(
  Source: ComponentType<{ outlet: OutletContextValue } & T>
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
