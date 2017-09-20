import React from 'react'
import * as mobx from 'mobx'
import ReactDOM from 'react-dom'
import { createHashHistory } from 'history'
import { install, RouterProvider } from 'mobx-little-router-react'
import stores from './stores'

import { HomeRoute, LoginRoute, ShowsRoute, AboutRoute, ContactRoute, ShowRoute, TagRoute, ActorRoute, AdminRoute } from './routes'
import App from './App'

const delay = (ms) => new Promise((resolve) => { setTimeout(resolve, ms) })

const router = install({
  history: createHashHistory(),
  getContext: () => ({
    stores
  }),
  routes: [
    { path: '', match: 'full', component: HomeRoute },
    { path: 'redirect', match: 'full', redirectTo: '/shows' },
    { path: 'login', component: LoginRoute },
    { path: 'about', component: AboutRoute, animate: true },
    { path: 'contact', component: ContactRoute, animate: true },
    {
      path: 'shows',
      query: ['q'],
      component: ShowsRoute,
      children: [{
        path: ':id',
        component: ShowRoute,
        outlet: 'modal',
        animate: true
      }]
    },
    {
      path: 'actors/:id',
      component: ActorRoute,
      outlet: 'modal',
      animate: true
    },
    {
      path: 'tags/:tag',
      component: TagRoute
    },
    {
      path: 'admin',
      component: AdminRoute,
      canActivate: (route, navigation) => {
        const { stores: { SessionStore } } = route.context

        if (SessionStore.isAuthenticated) {
          return true
        } else {
          SessionStore.unauthorizedNavigation = navigation
          return navigation.redirectTo('/login')
        }
      },
      willResolve: () => delay(1000)
    }
  ]
})

window.store = router.store
window.router = router
window.mobx = mobx

router.subscribeEvent((ev) => {
  if (ev.type === 'NAVIGATION_START') {
    console.group(`%cNavigation (${ev.navigation.sequence})`, 'color: black')
  }
  const groupColor = getGroupColor(ev)
  console.group(`%c${ev.type}`, `font-weight: normal; color: ${groupColor}`)
  console.log(`Elapsed = ${ev.elapsed}`)
  console.log(`Navigation`, ev.navigation)
  console.groupEnd(ev.type)
  if (ev.type === 'NAVIGATION_END' || ev.type === 'NAVIGATION_CANCELLED') {
    console.groupEnd()
  }
})

function getGroupColor(ev) {
  switch (ev.type) {
    case 'NAVIGATION_START':
      return 'black'
    case 'NAVIGATION_CANCELLED':
      return 'red'
    case 'NAVIGATION_ERROR':
      return 'red'
    case 'NAVIGATION_END':
      return 'green'
    default:
      return '#999'
  }
}

router.start(() => {
  ReactDOM.render(
    <RouterProvider router={router}>
      <App />
    </RouterProvider>,
    document.getElementById('root')
  )
})
