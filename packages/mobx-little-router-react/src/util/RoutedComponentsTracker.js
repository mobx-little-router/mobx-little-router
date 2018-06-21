// @flow
import { action, extendObservable, observable, observe, reaction } from 'mobx'
import { areRoutesEqual, EventTypes, type Route, type Router } from 'mobx-little-router'

/*
 * This class tracks changes for routes with a component given an optional outletName and depthIndex.
 */
export default class RoutedComponentsTracker {
  router: Router
  _subscriptions: Function[]
  prevRoutes: Route<*, *>[]
  currRoutes: Route<*, *>[]
  to: Route<*, *> | null
  from: Route<*, *> | null
  isNavigating: boolean
  isTransitioning: boolean

  constructor(router: Router, outletName: ?string, depthIndex: number) {
    this.router = router
    this._subscriptions = []

    extendObservable(
      this,
      {
        prevRoutes: [],
        get currRoutes() {
          return filterRoutes(router.activatedRoutes)
        },
        get to() {
          return findRoute(depthIndex, outletName, this.currRoutes)
        },
        get from() {
          return findRoute(depthIndex, outletName, this.prevRoutes)
        },
        get isTransitioning() {
          return (
            this.router.currentEventType === EventTypes.NAVIGATION_TRANSITION_START &&
            !areRoutesEqual(this.to, this.from) &&
            (canTransition(this.to) || canTransition(this.from))
          )
        }
      }
    )
  }

  start() {
    this._subscriptions.push(
      observe(
        this,
        'currRoutes',
        action(({ oldValue }) => {
          this.prevRoutes = oldValue
        })
      )
    )
    this._subscriptions.push(
      reaction(
        () => this.router.currentEventType === EventTypes.NAVIGATION_END,
        action(() => {
          this.prevRoutes = []
        }),
        { fireImmediately: true }
      )
    )
  }

  stop() {
    this._subscriptions.forEach(d => d())
    this._subscriptions = []
  }
}

const filterRoutes = (routes: *) => routes.filter(route => route.data.component)

const findRoute = (outletIdx, outletName, routes): Route<*, *> | null => {
  if (typeof outletName === 'string') {
    return routes.slice().reverse().find(route => route.data.outlet === outletName) || null
  } else {
    return routes.filter(route => !route.data.outlet)[outletIdx] || null
  }
}
const canTransition = node => (node ? typeof node.onTransition === 'function' : false)
