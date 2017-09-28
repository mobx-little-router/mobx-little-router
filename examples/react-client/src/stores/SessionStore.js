import { extendObservable } from 'mobx'

class SessionStore {
  constructor() {
    extendObservable(this, {
      isAuthenticated: false
    })
  }
}

export default SessionStore
