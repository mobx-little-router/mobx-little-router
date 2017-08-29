import { observable } from 'mobx'

const sessionStore = observable({
  isAuthenticated: false
})

export default sessionStore
