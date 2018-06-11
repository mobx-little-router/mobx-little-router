/*
 * This module contains effects that exist within the `shows` route.
 * Effects run as a reaction to route params and query changes.
 */
import { autorun, action } from 'mobx'



export const fetchShows = ({ route, stores }) => {
  const updatePending = action((value) => {
    route.state.isPending = value
  })

  return autorun(() => {
    if (route.query.q) {
      updatePending(true)
      fetch(`https://api.tvmaze.com/search/shows?q=${route.query.q}`)
        .then(res => res.json())
        .then(json => json.map(({ show }) => show))
        .then(data => stores.ShowsStore.load(data))
        .then(() => updatePending(false))
    }
  }, { delay: 200 })
}

export function fetchShow({ route, stores }) {
  const updatePending = action((value) => {
    route.state.isPending = value
  })

  return autorun(() => {
    if (route.params.id) {
      updatePending(true)
      fetch(`https://api.tvmaze.com/shows/${route.params.id}?embed=cast`)
        .then(res => res.json())
        .then(data => stores.ShowsStore.loadDetails(route.params.id, data))
        .then(() => updatePending(false))
    }
  })
}
