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
    { path: '', match: 'full', data: { component: IndexRoute } },
    { path: 'redirect', match: 'full', redirectTo: '/shows' },
    { path: 'login', data: { component: LoginRoute } },
    { 
      path: 'about',
      data: { component: AboutRoute },
      onTransition: () => delay(400)
    },
    {
      path: 'contact',
      data: { component: ContactRoute },
      onTransition: () => delay(400)
    },
    {
      path: 'shows',
      data: { component: ShowsRoute },
      children: [{
        path: ':id',
        data: {
          component: ShowRoute,
          outlet: 'modal'
        },
        onTransition: (node, transition) => {
          console.log(node, transition)
          return delay(400)
        }
      }]
    },
    {
      path: 'actors/:id',
      data: {
        component: ActorRoute,
        outlet: 'modal'
      },
      onTransition: () => delay(400)
    },
    {
      path: 'tags/:tag',
      data: { component: TagRoute }
    },
    {
      path: 'admin',
      data: { component: AdminRoute },
      canActivate: (node, navigation, context) => {
        const { stores: { SessionStore } } = context
        
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
  console.log(ev.type, ev.navigation)
})

router.start(() => {
  ReactDOM.render(
    <RouterProvider router={router}>
      <App />
    </RouterProvider>,
    document.getElementById('root')
  )
}).catch(() => router.stop())
