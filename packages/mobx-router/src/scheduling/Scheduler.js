// @flow
import type { Action } from 'history'
import type { IObservableArray } from 'mobx'
import { action, autorun, computed, observable, runInAction, toJS, when } from 'mobx'
import type { Location } from '../history/types'
import type { HookType, MatchResult } from '../routing/types'
import type RouterStore from '../routing/RouterStore'
import areNodesEqual from '../routing/areNodesEqual'
import shallowEqual from '../util/shallowEqual'
import { GuardFailure } from '../errors'

type NavigationParams = {
  location: Location,
  parts: string[],
  action: ?Action
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

  scheduleNavigation = (nextLocation: Location, action: ?Action) => {
    const { location } = this.store

    // If location path and query has not changed, skip it.
    if (
      location &&
      location.pathname === nextLocation.pathname &&
      location.query &&
      shallowEqual(location.query, nextLocation.query)
    ) {
      return
    }

    runInAction(() => {
      this.navigation = {
        location: nextLocation,
        parts: nextLocation.pathname.split('/'),
        action
      }
    })
  }

  @action
  clearNavigation() {
    this.navigation = null
  }

  processNavigation = async () => {
    const { navigation } = this

    if (!navigation) {
      return
    }

    const { location, parts } = navigation

    try {
      const path: MatchResult[] = await this.store.state.pathFromRoot(parts)
      await this.activatePath(path)
      this.store.setLocation(location)
    } catch (err) {
      this.store.setError(err)
    } finally {
      this.clearNavigation()
    }
  }

  // TODO: Make sure deactivation is reversed, and onLeave is only called once all deactivation is processed.
  activatePath = async (activating: MatchResult[]) => {
    try {
      const deactivating = this.store.activeNodes
        .filter(node => activating.some(x => !areNodesEqual(x.node, node)))
        .reverse()
        .map(node => ({
          node,
          segment: '',
          params: node.value.params || {}
        }))

      console.log('activating', deactivating.map(x => toJS(x.node)))
      console.log('deactivating', deactivating.map(x => toJS(x.node)))

      // Make sure we can deactivate nodes first. We need to map deactivating nodes to a MatchResult object.
      await this.runGuards(['canDeactivate'], [], deactivating)

      // await this.runGuards(['canActivate'], [], activating)
      //
      // await this.runGuards(['onLeave', 'onEnter'], [], activating)
    } catch (err) {
      // Make sure we chain errors back up!
      throw err
    }
  }

  runGuards = async (
    types: HookType[],
    processed: MatchResult[],
    remaining: MatchResult[]
  ) => {
    const [curr, ...rest] = remaining

    // Done!
    if (!curr) {
      return
    }

    const { params, node } = curr
    const { value: { hooks } } = node

    const guard = types.reduce((acc, type) => {
      // Make sure previous lifecycle resolved before proceeding with next.
      // A rejection will skip any unprocessed lifecycle hooks.
      console.log('type', type)
      return acc.then(() =>
        Promise.all(
          hooks[type].map(f => {
            console.log('-------- f', f)
            f(node, params).catch(error => {
              throw new GuardFailure(error, node, params)
            })
          })
        )
      )
    }, Promise.resolve())

    try {
      await guard
      // Run the next guards.
      await this.runGuards(types, [curr], rest)
    } catch (err) {
      // When we encounter a failed guard, just stop navigation.
      throw err
    }
  }
}
