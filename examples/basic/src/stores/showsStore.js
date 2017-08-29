import { observable } from 'mobx'

const showsStore = observable({
  collection: [],
  currentShow: null
})

export default showsStore