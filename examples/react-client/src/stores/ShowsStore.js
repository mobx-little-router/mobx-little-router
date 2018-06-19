import { extendObservable, runInAction, observable } from 'mobx'

class ShowsStore {
  constructor() {
    extendObservable(this, {
      shows: [],
      details: observable.map()
    })
  }

  load(shows) {
    runInAction(() => {
      this.shows.replace(shows)
    })
  }

  loadDetails(id, details) {
    runInAction(() => {
      this.details.set(id, details)
    })
  }

  getDetails(id) {
    return this.details.get(id)
  }

  getById(id) {
    return this.shows.find(show => show.id === Number(id))
  }
}

export default ShowsStore
