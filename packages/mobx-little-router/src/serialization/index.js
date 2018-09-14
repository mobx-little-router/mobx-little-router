// @flow
import type Router from '../Router'
import type RouterStore from '../model/RouterStore'
import type { Route } from '../model/types'
import { toJS } from 'mobx'

export function serialize(router: Router) {
  if (router.isNavigating) throw new Error('Cannot serialize a router that is navigating.')
  return {
    activatedRoutes: router.activatedRoutes.reduce((acc, r) => {
      acc[r.node.value.key] = serializeActivatedRoute(r)
      return acc
    }, {}),
    store: serializeStore(router._store)
  }
}

function serializeActivatedRoute(route: Route<*, *>) {
  return {
    key: route.key,
    nodeKey: route.node.value.key,
    model: toJS(route.model)
  }
}

function serializeStore(store: RouterStore) {
  return {
    location: toJS(store.location),
    nextKey: store.nextKey
  }
}
