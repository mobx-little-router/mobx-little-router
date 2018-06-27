import ShowsRoute from './ShowsRoute'
import ShowRoute from './ShowRoute'
import * as fx from './effects'
import { when } from 'mobx'

export default function init({ router, stores }) {
  const ROUTE_KEYS = {
    shows: 'shows',
    show: 'show',
  }

  return [
    {
      key: ROUTE_KEYS.shows,
      path: '/',
      query: ['q'],
      state: {
        isPending: true
      },
      computed() {
        return {
          get shows() {
            return stores.ShowsStore.shows
          }
        }
      },
      subscriptions() {
        const route = this
        return fx.fetchShows({ route, stores })
      },
      component: ShowsRoute,
      children: [
        {
          key: ROUTE_KEYS.show,
          path: '/:id',
          query: ['q'],
          state: {
            isPending: true
          },
          computed() {
            const { ShowsStore } = stores
            const { params } = this
            const selected = router.select({ shows: { computed: { shows: [] } } })

            return {
              get numItems() {
                return selected.shows.computed.shows.length
              },

              get index() {
                return selected.shows.computed.shows.findIndex((show) => this.activeShow && show.id === this.activeShow.id) + 1
              },
              
              get activeShow() {
                return ShowsStore.getDetails(params.id)
              },

              get prevShow() {
                if (ShowsStore.shows && ShowsStore.shows.length > 1) {
                  const currIdx = ShowsStore.shows.findIndex(x => x.id === Number(params.id))
                  if (currIdx > 0) {
                    return ShowsStore.shows[currIdx - 1]
                  }
                }
                return null
              },

              get nextShow() {
                if (ShowsStore.shows && ShowsStore.shows.length > 1) {
                  const currIdx = ShowsStore.shows.findIndex(x => x.id === Number(params.id))
                  if (currIdx < ShowsStore.shows.length - 1) {
                    return ShowsStore.shows[currIdx + 1]
                  }
                }
                return null
              }
            }
          },
          subscriptions() {
            const route = this
            return fx.fetchShow({ route, stores })
          },
          //XXX this blocks the route transition chicken and egg problem
          willResolve(route) {
            return when(() => !route.state.isPending)
          },
          component: ShowRoute,
          outlet: 'modal',
          animate: true
        }
      ]
    }
  ]
}
