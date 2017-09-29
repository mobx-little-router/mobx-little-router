import ShowsRoute from './ShowsRoute'
import ShowRoute from './ShowRoute'

const delay = ms => new Promise(res => setTimeout(res, ms))

export default [
  {
    path: '',
    query: ['q'],
    willResolve: async route => {
      const { ShowsStore } = route.context.stores

      // Faking some network order and latency issues.
      await delay(Math.random() * 500)
      if (!route.query.q) {
        return () => ShowsStore.load([])
      } else {
        const res = await fetch(`https://api.tvmaze.com/search/shows?q=${route.query.q}`)
        const data = await res.json()
        return () => {
          ShowsStore.load(data.map(({ show }) => show))
        }
      }
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
