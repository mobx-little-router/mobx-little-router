import AdminRoute from './AdminRoute'

export default function init({ router, stores }) {
  const ROUTE_KEYS = {
    admin: 'admin'
  }

  return [
    {
      key: ROUTE_KEYS.admin,
      path: '/',
      component: AdminRoute,
      canActivate: (route, navigation) => {
        if (stores.SessionStore.isAuthenticated) {
          return true
        } else {
          stores.SessionStore.unauthorizedNavigation = navigation
          return navigation.redirectTo('/login')
        }
      },
      canDeactivate: (route, navigation) => {
        if (window.confirm('Discard changes?')) {
          return true
        }
      }
    }
  ]
}
