import { observable } from 'mobx'

export default class DataStore {
  constructor() {
    this.randomGifs = observable.map()
  }
}
