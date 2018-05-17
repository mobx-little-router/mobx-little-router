/*
 * This module contains effects that exist within the `shows` route.
 * Effects run as a reaction to route params and query changes.
 */
import { autorun } from 'mobx'

export function fetchShows({ stores, input }) {
  return autorun(() => {
    const { shows } = input.get()
    if (shows.query.q) {
      fetch(`https://api.tvmaze.com/search/shows?q=${shows.query.q}`)
        .then(res => res.json())
        .then(json => json.map(({ show }) => show))
        .then(data => stores.ShowsStore.load(data))
    }
  })
}

export function fetchShow({ stores, input }) {
  return autorun(() => {
    const { show } = input.get()
    if (show.params.id) {
      fetch(`https://api.tvmaze.com/shows/${show.params.id}?embed=cast`)
        .then(res => res.json())
        .then(data => stores.ShowsStore.loadDetails(show.params.id, data))
    }
  })
}
