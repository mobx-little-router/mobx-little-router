/*
 * This module contains effects that exist within the `shows` route.
 * Effects run as a reaction to route params and query changes.
 */
import { autorun } from 'mobx'

export function fetchActor({ stores, input }) {
  return autorun(() => {
    const { actor } = input.get()

    if (actor.params.id) {
      const actorPromise = fetch(`https://api.tvmaze.com/people/${actor.params.id}`)
        .then(res => res.json())

      const creditsPromise = fetch(`https://api.tvmaze.com/people/${actor.params.id}/castcredits?embed=show`)
        .then(res => res.json())

      Promise.all([actorPromise, creditsPromise])
        .then(([ actorData, creditsData ]) => {
          stores.ActorsStore.load(actor.params.id, { ...actorData, credits: creditsData })
        })
    }
  })
}
