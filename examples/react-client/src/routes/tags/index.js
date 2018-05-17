import TagRoute from './TagRoute'

export default function init({ router, stores }) {
  const ROUTE_KEYS = {
    tag: 'tag'
  }

  return [
    {
      key: ROUTE_KEYS.tag,
      path: '/:tag',
      component: TagRoute
    }
  ]
}
