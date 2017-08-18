import React from 'react'
import * as mobx from 'mobx'
import ReactDOM from 'react-dom'
import { createHashHistory } from 'history'
import { install } from 'mobx-little-router'
import { RouterProvider } from 'mobx-little-router-react'

import { IndexRoute, ShowsRoute, AboutRoute, ContactRoute, ShowRoute, TagRoute } from './routes'
import App from './App'

const router = install({
  createHistory: createHashHistory,
  routes: [
    { path: '', data: { component: IndexRoute } },
    { path: 'about', data: { component: AboutRoute } },
    { path: 'contact', data: { component: ContactRoute } },
    {
      path: 'shows',
      data: { component: ShowsRoute },
      children: [{
        path: ':id',
        data: { component: ShowRoute }
      }]
    },
    {
      path: 'tags/:tag',
      data: { component: TagRoute }
    }
  ]
})

window.store = router.store
window.mobx = mobx

router.start(() => {
  ReactDOM.render(
    <RouterProvider router={router}>
      <App />
    </RouterProvider>,
    document.getElementById('root')
  )
}).catch(() => router.stop())
