import ShowsRoute from './ShowsRoute'
import ShowRoute from './ShowRoute'

const delay = ms => new Promise(res => setTimeout(res, ms))

export default [
  {
    path: '',
    query: ['q'],
    willResolve: async route => {
      const { ShowsStore } = route.context.stores
      let data

      // Faking some network order and latency issues.
      await delay(Math.random() * 500)

      if (!route.query.q) {
        data = []
      } else {
        const res = await fetch(`https://api.tvmaze.com/search/shows?q=${route.query.q}`)
        const json = await res.json()
        data = json.map(({ show }) => show)
      }

      // This returns a setter function that will be called by Router (assuming navigation is not cancelled).
      return () => ShowsStore.load(data)
    },
    component: ShowsRoute,
    children: [
      {
        path: ':id',
        query: ['q'],
        willResolve: async route => {
          const { ShowsStore } = route.context.stores
          const res = await fetch(
            `https://api.tvmaze.com/shows/${route.params.id}?embed=cast`
          )
          const data = await res.json()
          ShowsStore.loadDetails(route.params.id, data)
        },
        component: ShowRoute,
        outlet: 'modal',
        animate: true
      }
    ]
  }
]
