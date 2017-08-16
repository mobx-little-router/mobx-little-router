import React from 'react'
import * as mobx from 'mobx'
import ReactDOM from 'react-dom'
import { createHashHistory } from 'history'
import { install } from 'mobx-little-router'
import { RouterProvider } from 'mobx-little-router-react'

import { IndexRoute, AboutRoute, ContactRoute, ShowRoute } from './routes'
import App from './App'

const router = install({
  createHistory: createHashHistory,
  routes: [
    { path: '', data: { component: IndexRoute } },
    { path: 'about', data: { component: AboutRoute } },
    { path: 'contact', data: { component: ContactRoute } },
    {
      path: 'shows/:id',
      data: { component: ShowRoute }
    }
  ]
})

window.store = router.store
window.mobx = mobx

router.start().then(() => {
  ReactDOM.render(
    <RouterProvider router={router}>
      <App />
    </RouterProvider>,
    document.getElementById('root')
  )
})
