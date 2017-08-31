const mobx = require('mobx')

module.exports = class DataStore {
  constructor() {
    this.randomGifs = mobx.observable.map()
  }
}
