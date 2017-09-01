import React from 'react'
import * as mobx from 'mobx'
import ReactDOM from 'react-dom'
import { createHashHistory } from 'history'
import { install } from 'mobx-little-router'
import { RouterProvider } from 'mobx-little-router-react'
import stores from './stores'

import { IndexRoute, LoginRoute, ShowsRoute, AboutRoute, ContactRoute, ShowRoute, TagRoute, ActorRoute, AdminRoute } from './routes'
import App from './App'

const delay = (ms) => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve()
    }, ms)
  )
}

const router = install({
  createHistory: createHashHistory,
  getContext: () => ({
    stores
  }),
  routes: [
    { path: '', match: 'full', getData: () => ({ component: IndexRoute }) },
    { path: 'redirect', match: 'full', redirectTo: '/shows' },
    { path: 'login', getData: () => ({ component: LoginRoute }) },
    { 
      path: 'about',
      getData: () => {
        return { component: AboutRoute, isTransitioned: false }
      },
      onTransition: () => delay(400)
    },
    {
      path: 'contact',
      getData: () => ({ component: ContactRoute }),
      onTransition: () => delay(400)
    },
    {
      path: 'shows',
      getData: () => {
        console.log('getting shows data')
        return { component: ShowsRoute }
      },
      children: [{
        path: ':id',
        getData: () => {
          console.log('getting show view data')
          return {
            component: ShowRoute,
            outlet: 'modal'
          }
        },
        onTransition: (route, transition) => {
          console.log(route, transition)
          return delay(400)
        }
      }]
    },
    {
      path: 'actors/:id',
      getData: () => ({
        component: ActorRoute,
        outlet: 'modal'
      }),
      onTransition: () => delay(400)
    },
    {
      path: 'tags/:tag',
      getData: () => ({ component: TagRoute })
    },
    {
      path: 'admin',
      getData: () => ({ component: AdminRoute }),
      canActivate: (route, navigation) => {
        const { stores: { SessionStore } } = route.context
        
        if (SessionStore.isAuthenticated) {
          return true
        } else {
          SessionStore.unauthorizedNavigation = navigation
          return navigation.redirectTo('/login')
        }
      }
    }
  ]
})

window.store = router.store
window.router = router
window.mobx = mobx

router.subscribeEvent((ev) => {
  if (ev.type === 'NAVIGATION_START') {
    console.group(`Navigation (${ev.navigation.sequence})`)
  }
  console.log(ev.type, ev.navigation || ev.nextNavigation)
  if (ev.type === 'NAVIGATION_END') {
    console.groupEnd()
  }
})

router.start(() => {
  ReactDOM.render(
    <RouterProvider router={router}>
      <App />
    </RouterProvider>,
    document.getElementById('root')
  )
})
