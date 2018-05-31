// @flow
import React, { Component, createContext } from 'react'
import withRouter from '../hoc/withRouter'
import withOutlet from '../hoc/withOutlet'
import { observer } from 'mobx-react'
import { computed, extendObservable } from 'mobx'
import type { Router } from 'mobx-little-router'
import { areRoutesEqual } from 'mobx-little-router'
import { OutletType } from '../propTypes'
import TransitionGroup from './TransitionGroup'
import OutletContext from '../contexts/OutletContext'

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
  outlet: OutletType
}

class Outlet extends Component<OutletProps> {
  // static contextTypes = {
  //   // We may have another outlet above us in the context.
  //   outlet: OutletType
  // }

  // static childContextTypes = {
  //   outlet: OutletType
  // }

  currRoutes: any
  prevRoutes: any
  to: any
  from: any
  isTransitioning: boolean

  constructor(props, context) {
    super(props, context)

    const { router, name } = this.props    
    const idx = this.getCurrentIndex()

    extendObservable(this, {
      get currRoutes() { return filterRoutes(router._store.routes) },
      get prevRoutes() { return filterRoutes(router._store.prevRoutes) },
      get to() { return findRoute(this.currRoutes, idx, name) },
      get from() { return findRoute(this.prevRoutes, idx, name) },
      get isTransitioning() {
        return this.prevRoutes.length > 0 &&
        !areRoutesEqual(this.to, this.from) &&
        (canTransition(this.to) || canTransition(this.from))
      }
    })
  }

  getChildOutlet(): OutletType {
    return {
      index: this.getCurrentIndex() + 1
    }
  }

  getCurrentIndex() {
    const { outlet } = this.props
    return typeof outlet !== 'undefined'
      ? outlet.index
      : 0
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
            to={this.to}
            from={this.isTransitioning ? this.from : undefined}
            isTransitioning={this.isTransitioning}
            additionalProps={rest}
          />
        </div>
      </OutletContext.Provider>
    )
  }
}

const filterRoutes = routes => routes.filter(route => route.data.component)
const findRoute = (routes, outletIdx, outletName) => {
  if (typeof outletName === 'string') {
    return routes.slice().reverse().find(route => route.data.outlet === outletName)
  } else {
    return routes.filter(route => !route.data.outlet)[outletIdx]
  }
}
const canTransition = node => (node ? typeof node.onTransition === 'function' : false)

export default withRouter(withOutlet(observer(Outlet)))
