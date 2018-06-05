// @flow
import React, { Component, createContext } from 'react'
import withRouter from '../hoc/withRouter'
import withOutlet from '../hoc/withOutlet'
import { observer } from 'mobx-react'
import { computed, extendObservable } from 'mobx'
import type { Router } from 'mobx-little-router'
import { areRoutesEqual } from 'mobx-little-router'
import { observe, extendObservable, observable } from 'mobx'
import { type Router, EventTypes, areRoutesEqual } from 'mobx-little-router'
import { OutletType } from '../propTypes'

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
  currRoutes: any
  prevRoutes: any
  to: any
  from: any
  isTransitioning: boolean

  _dispose: null | Function = null

  constructor(props, context) {
    super(props, context)

    const { name } = this.props
    const idx = this.getCurrentIndex()

    extendObservable(
      this,
      {
        prevRoutes: [],
        get currRoutes() {
          return filterRoutes(this.props.router._store.activatedRoutes)
        },
        get to() {
          return findRoute(this.currRoutes, idx, name)
        },
        get from() {
          return findRoute(this.prevRoutes, idx, name)
        },
        get isNavigating() {
          return this.props.router._scheduler.event.type !== EventTypes.NAVIGATION_END
        },
        get isTransitioning() {
          return (
            this.isNavigating &&
            !areRoutesEqual(this.to, this.from) &&
            (canTransition(this.to) || canTransition(this.from))
          )
        }
      },
      {
        prevRoutes: observable
      }
    )

    this._dispose = observe(this, 'currRoutes', change => {
      this.prevRoutes = change.oldValue
    })
  }

  getChildOutlet(): OutletContextValue {
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

// Exported for tests.
export const filterRoutes = (routes: *) => routes.filter(route => route.data.component)

const findRoute = (routes, outletIdx, outletName) => {
  if (typeof outletName === 'string') {
    return routes.find(route => route.data.outlet === outletName)
  } else {
    return routes.filter(route => !route.data.outlet)[outletIdx]
  }
}

const canTransition = node => (node ? typeof node.onTransition === 'function' : false)

export default withRouter(withOutlet(observer(Outlet)))
