import React from 'react'
import * as mobx from 'mobx'
import ReactDOM from 'react-dom'
import { createHashHistory } from 'history'
import { install, transformConfig } from 'mobx-little-router'
import { RouterProvider } from 'mobx-little-router-react'
import stores from './stores'

import { HomeRoute, LoginRoute, ShowsRoute, AboutRoute, ContactRoute, ShowRoute, TagRoute, ActorRoute, AdminRoute } from './routes'
import App from './App'

const onTransition = ({ type, target }) => {
  return new Promise((resolve, reject) => {
    mobx.when(
      () => {
        return target.data.transitionState === (type === 'entering' ? 'entered' : 'exited')
      },
      () => {
        console.log("RESOLVING_TRANSITION", target.key)
        resolve()
      }
    )
  })
}

const delay = (ms) => new Promise((resolve) => { setTimeout(resolve, ms) })

const router = install({
  history: createHashHistory(),
  getContext: () => ({
    stores
  }),
  middleware: transformConfig(config => {
    const { component, outlet } = config
    delete config.component
    delete config.outlet
    return {
      ...config,
      getData: () => ({
        ...(config.getData ? config.getData(): {}),
        component,
        outlet
      })
    }
  }),
  routes: [
    { path: '', match: 'full', component: HomeRoute },
    { path: 'redirect', match: 'full', redirectTo: '/shows' },
    { path: 'login', component: LoginRoute },
    { path: 'about', component: AboutRoute, onTransition: () => delay(400) },
    { path: 'contact', component: ContactRoute, onTransition: () => delay(400) },
    {
      path: 'shows',
      query: ['q'],
      component: ShowsRoute,
      children: [{
        path: ':id',
        component: ShowRoute,
        outlet: 'modal',
        onTransition
      }]
    },
    {
      path: 'actors/:id',
      component: ActorRoute,
      outlet: 'modal',
      onTransition
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
  if (ev.type === 'NAVIGATION_END' || ev.type === 'NAVIGATION_CANCELLED') {
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
