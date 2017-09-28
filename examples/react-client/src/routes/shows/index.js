import ShowsRoute from './ShowsRoute'
import ShowRoute from './ShowRoute'

const delay = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

export default [
  {
    path: '',
    query: ['q'],
    willResolve: async route => {
      await delay(Math.random() * 1000 + 1000)
      const { ShowsStore } = route.context.stores
      if (!route.query.q) {
        ShowsStore.load([])
      } else {
        const res = await fetch(`https://api.tvmaze.com/search/shows?q=${route.query.q}`)
        const data = await res.json()
        ShowsStore.load(data.map(({ show }) => show))
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
