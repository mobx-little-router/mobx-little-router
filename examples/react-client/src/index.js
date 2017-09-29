import React from 'react'
import * as mobx from 'mobx'
import ReactDOM from 'react-dom'
import { createHashHistory } from 'history'
import { Provider } from 'mobx-react'
import { install, RouterProvider } from 'mobx-little-router-react'
import createStores from './stores'
import {
  HomeRoute,
  LoginRoute,
  AboutRoute,
  ContactRoute,
  TagRoute,
  ActorRoute,
  AdminRoute
} from './routes'
import App from './App'

const delay = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

const stores = createStores()

const router = install({
  history: createHashHistory(),
  getContext: () => ({
    stores
  }),
  routes: [
    { path: '', component: HomeRoute },
    { path: 'redirect', redirectTo: '/shows' },
    { path: 'login', component: LoginRoute },
    { path: 'about', component: AboutRoute, animate: true },
    { path: 'contact', component: ContactRoute, animate: true },
    {
      path: 'shows',
      loadChildren: () => import('./routes/shows')
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
      canDeactivate: (route, navigation) => {
        if (window.confirm('Discard changes?')) {
          return true
        }
      },
      willResolve: () => delay(1000)
    }
  ]
})

window.store = router.store
window.router = router
window.mobx = mobx

router.subscribeEvent(ev => {
  if (ev.type === 'NAVIGATION_START') {
    console.group(`%cNavigation (${ev.navigation.sequence})`, 'color: black')
  }

  if (ev.navigation && ev.navigation.sequence > -1) {
    console.log(
      `%c${ev.type}`,
      `color:${getGroupColor(ev)}`,
      `(${ev.elapsed}ms)`,
      ev
    )
  }

  if (ev.done) {
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
      <Provider {...stores}>
        <App />
      </Provider>
    </RouterProvider>,
    document.getElementById('root')
  )
})
