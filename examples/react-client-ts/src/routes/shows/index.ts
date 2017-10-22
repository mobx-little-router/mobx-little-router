import ShowsRoute from './ShowsRoute'
import ShowRoute from './ShowRoute'

export default [
  {
    path: '',
    query: ['q'],
    getData: () => ({ resolveStatus: null }),
    willResolve: async route => {
      const { ShowsStore } = route.context.stores
      let data

      (async () => {
        route.data.resolveStatus = 'INIT'

        // Wait a threshold before firing the PENDING state, this allows for less flashes on screen when a resolve finishes quickly
        setTimeout(() => {
          if (route.data.resolveStatus === 'INIT') {
            route.data.resolveStatus = 'PENDING'
          }
        }, 200)

        try {
          await delay(1000)

          if (!route.query.q) {
            data = []
          } else {
            const res = await fetch(`https://api.tvmaze.com/search/shows?q=${route.query.q}`)
            const json = await res.json()
            data = json.map(({ show }) => show)

            ShowsStore.load(data)
          }
          route.data.resolveStatus = 'FULFILLED'
        } catch (err) {
          route.data.resolveStatus = 'ERROR'
        }
      })()
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

const delay = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })
