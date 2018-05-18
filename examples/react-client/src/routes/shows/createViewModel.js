import { observable } from 'mobx'

export default function createViewModel({ input, stores }) {
  const { ShowsStore } = stores
  return observable({
    get activeShow() {
      const { show } = input
      if (show.params.id) {
        return stores.ShowsStore.getDetails(show.params.id)
      } else {
        return null
      }
    },

    get prevShow() {
      const { show } = input
      if (ShowsStore.shows && ShowsStore.shows.length > 0) {
        const currIdx = ShowsStore.shows.findIndex(x => x.id === Number(show.params.id))
        if (currIdx > 0) {
          return ShowsStore.shows[currIdx - 1]
        }
      }
      return null
    },

    get nextShow() {
      const { show } = input
      if (ShowsStore.shows && ShowsStore.shows.length > 0) {
        const currIdx = ShowsStore.shows.findIndex(x => x.id === Number(show.params.id))
        if (currIdx < ShowsStore.shows.length - 1) {
          return ShowsStore.shows[currIdx + 1]
        }
      }
      return null
    }
  })
}
