import { observable } from 'mobx'

const SessionStore = observable({
  isAuthenticated: false
})

export default SessionStore
