import { action } from 'mobx'

import Home from './Home'
import NotFound from './NotFound'

export default [
  {
    path: '',
    component: Home
  },
  {
    path: 'gif',
    loadChildren: () => import('../gif')
  },
  {
    path: 'about',
    loadChildren: () => import('../about')
  },
  {
    path: 'g/:topic',
    redirectTo: 'gif/:topic',
    willActivate: route => {
      // Adds hint to the context so we know that this route got redirected on server-side.
      route.context.status = 302
      return Promise.resolve()
    }
  },
  {
    path: '**',
    willActivate: action(route => {
      // Adds hint to the context so we know that this route did not match on server-side.
      route.context.status = 404
      return Promise.resolve()
    }),
    component: NotFound
  }
]
