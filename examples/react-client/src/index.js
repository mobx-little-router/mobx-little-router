import React from 'react'
import ReactDOM from 'react-dom'
import * as mobx from 'mobx'
import { createHashHistory } from 'history'
import { Provider } from 'mobx-react'
import { NotFound } from 'mobx-little-router'
import { install, RouterProvider } from 'mobx-little-router-react'
import createStores from './stores'
import CatchAllRoute from './routes/CatchAllRoute'
import HomeRoute from './routes/HomeRoute'
import LoginRoute from './routes/LoginRoute'
import App from './App'

const stores = createStores()

const ROUTES = [
  {
    key: 'root',
    path: '/',
    component: HomeRoute
  },
  {
    key: 'login',
    path: '/login',
    component: LoginRoute
  },
  {
    key: 'about',
    path: '/about',
    loadChildren: () => import('./routes/about').then(initModule)
  },
  {
    key: 'contact',
    path: '/contact',
    loadChildren: () => import('./routes/contact').then(initModule)
  },
  {
    path: '/collections',
    loadChildren: () => import('./routes/collections').then(initModule)
  },
  {
    path: '/shows',
    loadChildren: () => import('./routes/shows').then(initModule)
  },
  {
    path: '/actors',
    redirectTo: '/'
  },
  {
    path: '/actors',
    loadChildren: () => import('./routes/actors').then(initModule)
  },
  {
    path: '/tags',
    redirectTo: '/'
  },
  {
    path: '/tags',
    loadChildren: () => import('./routes/tags').then(initModule)
  },
  // Admin route with a session guard
  {
    path: '/admin',
    loadChildren: () => import('./routes/admin').then(initModule)
  },
  // A secret route that only the admin can see, everyone else gets a 404
  {
    path: '/secret',
    canActivate: (route: *, navigation: *) => {
      const { stores: { SessionStore } } = route.context
      if (SessionStore.isAuthenticated) {
        return true
      } else {
        return navigation.raise(NotFound)
      }
    }
  },
  {
    path: '**',
    component: CatchAllRoute
  }
]

const router = install({
  history: createHashHistory(),
  getContext: () => ({
    stores
  }),
  routes: ROUTES
})

window.store = router._store
window.router = router
window.mobx = mobx

router.subscribeEvent(ev => {
  if (ev.type === 'NAVIGATION_START') {
    console.group(`%cNavigation (${ev.navigation.sequence})`, 'color: black')
  }

  if (ev.navigation && ev.navigation.sequence > -1) {
    console.log(`%c${ev.type}`, `color:${getGroupColor(ev)}`, `(${ev.elapsed}ms)`, ev)
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

function initModule(module) {
  return module.default({ stores, router })
}
