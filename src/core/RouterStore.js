// @flow
import { action, observable } from 'mobx'
import type { GuardFn, GuardType, Location } from '../types'
import { GuardTypes } from '../types'

class RouterStore {
  @observable location: null | Location = null
  @observable error: null | Error = null
  @observable activating: ?Location = null
  @observable deactivating: ?Location = null
  canActivate: GuardFn[] = []
  canDeactivate: GuardFn[] = []

  @action
  setLocation(nextLocation: Location) {
    this.location = nextLocation
  }

  @action
  addGuard(type: GuardType, f: GuardFn) {
    switch (type) {
      case GuardTypes.CAN_ACTIVATE:
        return this.canActivate.push(f)
      case GuardTypes.CAN_DEACTIVATE:
        return this.canDeactivate.push(f)
      default:
        return
    }
  }
}

export default RouterStore
