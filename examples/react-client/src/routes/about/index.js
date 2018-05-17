import AboutRoute from './AboutRoute'

export default function init({ router, stores }) {
  const ROUTE_KEYS = {
    about: 'about'
  }

  return [
    {
      key: ROUTE_KEYS.about,
      path: '/',
      animate: true,
      component: AboutRoute
    }
  ]
}
