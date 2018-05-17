import ContactRoute from './ContactRoute'

export default function init({ router, stores }) {
  const ROUTE_KEYS = {
    contact: 'contact'
  }

  return [
    {
      key: ROUTE_KEYS.contact,
      path: '/',
      animate: true,
      component: ContactRoute
    }
  ]
}
