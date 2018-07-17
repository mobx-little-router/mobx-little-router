// @flow
import React, { Component } from 'react'
import withRouter from '../hoc/withRouter'
import withOutlet from '../hoc/withOutlet'
import { observer } from 'mobx-react'
import { reaction, action, extendObservable, observable, observe } from 'mobx'
import RoutedComponentsTracker from '../util/RoutedComponentsTracker'
import { type Router, EventTypes } from 'mobx-little-router'

import TransitionGroup from './TransitionGroup'
import OutletContext, { type OutletContextValue } from '../contexts/OutletContext'

/*
 * Outlet component is responsible for rendering the matched components
 * from RouterStore into it. Each Outlet element renders it's current node index
 * in the path, and then provides the next index to subsequent Outlet components.
 */

type OutletProps = {
  // The name will allow us to potentially render to different outlets
  // throughout the app. e.g. sidebar vs main
  name?: string,
  router: Router,
  outlet: OutletContextValue
}

class Outlet extends Component<OutletProps> {
  changeTracker: RoutedComponentsTracker

  constructor(props, context) {
    super(props, context)
    this.changeTracker = new RoutedComponentsTracker(
      this.props.router,
      this.props.name,
      this.getCurrentIndex()
    )
    this.changeTracker.start()
  }

  componentWillUnmount() {
    this.changeTracker.stop()
  }

  getChildOutlet(): OutletContextValue {
    return {
      index: this.getCurrentIndex() + 1
    }
  }

  getCurrentIndex() {
    const { outlet } = this.props
    return typeof outlet !== 'undefined' ? outlet.index : 0
  }

  render() {
    const { router, name, ...rest } = this.props
    const idx = this.getCurrentIndex()

    const dataProps = {
      'data-depth': idx,
      'data-name': name
    }

    return (
      <OutletContext.Provider value={this.getChildOutlet()}>
        <div className={`outlet`} {...dataProps}>
          <TransitionGroup
            router={router}
            to={this.changeTracker.to}
            from={this.changeTracker.isTransitioning ? this.changeTracker.from : null}
            isTransitioning={this.changeTracker.isTransitioning}
            additionalProps={rest}
          />
        </div>
      </OutletContext.Provider>
    )
  }
}

export default withRouter(withOutlet(observer(Outlet)))
