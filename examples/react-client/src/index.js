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
  AdminRoute,
  CollectionsRoute,
  CollectionRoute
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
    { path: 'login', component: LoginRoute },
    { path: 'about', component: AboutRoute, animate: true },
    { path: 'contact', component: ContactRoute, animate: true },
    {
      path: 'collections',
      component: CollectionsRoute,
      children: [
        { path: ':collectionId', component: CollectionRoute },
        { path: '', redirectTo: 'a' }
      ]
    },
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
    // Redirects
    {path: 'actors', redirectTo: '/' },
    {path: 'tags', redirectTo: '/' },
    {
      // Using relative path
      path: 'redirect',
      children: [
        { path: '', redirectTo: '../shows' }
      ]
    },
    // Admin route with a session guard
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
      // Fakes network delay
      willResolve: () => delay(20 + Math.random() * 200)
    }
  ]
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
