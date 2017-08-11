// @flow
import type { Action } from 'history'
import { toJS, computed, when, observable, runInAction, autorun } from 'mobx'
import type { IObservableArray } from 'mobx'
import type { Location } from '../types'
import type RouterStore from './RouterStore'
import shallowEqual from '../util/shallowEqual'

type NavigationParams = {
  location: Location,
  action: ?Action,
  promise: Promise<boolean>,
  reject: Function,
  resolve: Function
}

export default class Scheduler {
  store: RouterStore
  disposer: null | Function
  @observable navigation: null | NavigationParams

  constructor(store: RouterStore) {
    this.store = store
    this.disposer = null
    this.navigation = null
  }

  start() {
    this.disposer = autorun(this.processNavigation)
  }

  stop() {
    this.disposer && this.disposer()
    this.disposer = null
  }

  scheduleTransition = async (callback: (continueTransition: boolean) => void) => {
    callback(true)
  }

  scheduleNavigation = async (nextLocation: Location, action: ?Action): Promise<boolean> => {
    const { location } = this.store

    // If location path and query has not changed, skip it.
    if (
      location &&
      location.pathname === nextLocation.pathname &&
      location.query &&
      shallowEqual(location.query, nextLocation.query)
    ) {
      return false
    }

    let resolve: Function = nop
    let reject: Function = nop

    const promise = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })

    runInAction(() => {
      this.navigation = {
        location: nextLocation,
        action,
        promise,
        reject,
        resolve
      }
    })

    return promise
  }

  processNavigation = async () => {
    const{ navigation } = this

    if (!navigation) {
      return
    }

    const { action, location, resolve, reject, promise } = navigation

    try {
      if (location) {
        await this.processDeactivation(action, location)
        await this.processActivation(action, location)
      }
      resolve(true)
    } catch (err) {
      reject(err)
    }

    // Once we're done processing this navigation, remove it from queue.
    return promise
  }

  processActivation = async (action: ?Action, location: Location) => {
    const { canActivate } = this.store

    runInAction(() => {
      this.store.activating = location
    })

    const guard = canActivate.reduce((acc, curr) => {
      return acc.then(() => curr())
    }, Promise.resolve(true))

    await guard

    runInAction(() => {
      this.store.activating = null
      this.store.setLocation(location)
    })
  }

  processDeactivation = async (action: ?Action, location: Location) => {
    const { canDeactivate } = this.store

    runInAction(() => {
      this.store.deactivating = location
    })

    const guard = canDeactivate.reduce((acc, curr) => {
      return acc.then(() => curr())
    }, Promise.resolve(true))

    await guard

    runInAction(() => {
      this.store.deactivating = null
    })
  }
}

function nop() {}
