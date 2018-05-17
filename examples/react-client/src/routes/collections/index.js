import CollectionRoute from './CollectionRoute'
import CollectionsRoute from './CollectionsRoute'

export default function init({ router, stores }) {
  const ROUTE_KEYS = {
    collection: 'collection',
    collections: 'collections'
  }

  return [{
    key: ROUTE_KEYS.collections,
    path: '/',
    component: CollectionsRoute,
    children: [
      {
        key: ROUTE_KEYS.collection,
        path: '/:collectionId',
        component: CollectionRoute
      },
      {
        path: '/',
        redirectTo: 'a'
      }
    ]
  }]
}
