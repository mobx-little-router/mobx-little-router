import { action } from 'mobx'
import About from '../about/About'
import AboutNotFound from '../about/AboutNotFound'

export default [
  {
    path: '',
    component: About
  },
  {
    path: '**',
    willActivate: route => {
      route.context.status = 404
      return Promise.resolve()
    },
    component: AboutNotFound
  }
]
