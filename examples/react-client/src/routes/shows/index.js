import React from 'react'
import ShowsRoute from './ShowsRoute'
import ShowRoute from './ShowRoute'
import * as fx from './effects'

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
      computed(route) {
        return {
          get shows() {
            return stores.ShowsStore.shows
          }
        }
      },
      subscriptions() {
        const selected = router.select({
          [ROUTE_KEYS.shows]: { query: { q: null } }
        })
        return fx.fetchShows({ input: selected, stores })
      },
      component: ShowsRoute,
      children: [
        {
          key: ROUTE_KEYS.show,
          path: '/:id',
          query: ['q'],
          computed(route) {
            const { ShowsStore } = stores
            const { params } = route
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
            const selected = router.select({
              [ROUTE_KEYS.show]: { params: { id: null } }
            })
            return fx.fetchShow({ input: selected, stores })
          },
          component: ShowRoute,
          outlet: 'modal',
          animate: true
        }
      ]
    }
  ]
}
