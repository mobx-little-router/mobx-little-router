import { observable } from 'mobx'

const ShowsStore = observable({
  collection: [],
  currentShow: null
})

export default ShowsStore
