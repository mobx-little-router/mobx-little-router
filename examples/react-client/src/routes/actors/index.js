import ActorRoute from './ActorRoute'
import * as fx from './effects'

export default function init({ router, stores }) {
  const ROUTE_KEYS = {
    actor: 'actor'
  }
  const INPUTS = {
    actor: router.select({
      [ROUTE_KEYS.actor]: { params: { id: null } }
    })
  }

  fx.fetchActor({ input: INPUTS.actor, stores })

  return [
    {
      key: ROUTE_KEYS.actor,
      path: '/:id',
      outlet: 'modal',
      animate: true,
      component: ActorRoute
    }
  ]
}
