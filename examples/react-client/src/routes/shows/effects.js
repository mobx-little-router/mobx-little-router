/*
 * This module contains effects that exist within the `shows` route.
 * Effects run as a reaction to route params and query changes.
 */
import { autorun, flow, runInAction } from 'mobx'

const delay = (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export const fetchShows = ({ route, stores }) => {
  return autorun(() => {
    const { state, query } = route

    if (query.q) {
      flow(function* () {
        state.isPending = true
        const res = yield fetch(`https://api.tvmaze.com/search/shows?q=${query.q}`)
        const json = yield res.json()
        const data = yield json.map(({ show }) => show)

        // Fake delay
        yield delay(200)
        
        if (query.q) {
          stores.ShowsStore.load(data)
        }
        
        state.isPending = false
      })()
    } else {
      stores.ShowsStore.load([])
    }
  }, { delay: 200 })
}

export function fetchShow({ route, stores }) {
  return autorun(() => {
    const { state, params } = route

    if (route.params.id) {
      flow(function* () {
        state.isPending = true
        const res = yield fetch(`https://api.tvmaze.com/shows/${params.id}?embed=cast`)
        const json = yield res.json()
        stores.ShowsStore.loadDetails(params.id, json)
        state.isPending = false
      })()
    } 
  })
}
