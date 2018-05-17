import ShowsRoute from './ShowsRoute'
import ShowRoute from './ShowRoute'
import * as fx from './effects'
import createViewModel from './createViewModel'

export default function init({ router, stores }) {
  const ROUTE_KEYS = {
    shows: 'shows',
    show: 'show',
  }

  const INPUTS = {
    shows: router.select({
      [ROUTE_KEYS.shows]: { query: { q: null } }
    }),
    show: router.select({
      [ROUTE_KEYS.show]: { params: { id: null } }
    })
  }

  fx.fetchShows({ input: INPUTS.shows, stores })
  fx.fetchShow({ input: INPUTS.show, stores })

  return [
    {
      key: ROUTE_KEYS.shows,
      path: '/',
      query: ['q'],
      component: ShowsRoute,
      children: [
        {
          key: ROUTE_KEYS.show,
          path: '/:id',
          query: ['q'],
          getData: () => ({ model: createViewModel({ input: INPUTS.show, stores }) }),
          component: ShowRoute,
          outlet: 'modal',
          animate: true
        }
      ]
    }
  ]
}
