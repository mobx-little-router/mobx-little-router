import { extendObservable, runInAction, observable } from 'mobx'

class ActorsStore {
  constructor() {
    extendObservable(this, {
      details: observable.map()
    })
  }

  load(id, details) {
    runInAction(() => {
      this.details.set(id, details)
    })
  }

  get(id) {
    return this.details.get(id)
  }
}

export default ActorsStore
