import React from 'react'
import * as mobx from 'mobx'
import ReactDOM from 'react-dom'
import { createHashHistory } from 'history'
import { install } from 'mobx-little-router'
import { RouterProvider } from 'mobx-little-router-react'

import { IndexRoute, ShowsRoute, AboutRoute, ContactRoute, ShowRoute, TagRoute, ActorRoute } from './routes'
import App from './App'

const delay = (ms) => () => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve()
    }, ms)
  )
}

const router = install({
  createHistory: createHashHistory,
  routes: [
    { path: '', match: 'full', data: { component: IndexRoute } },
    { 
      path: 'about',
      data: { component: AboutRoute },
      onEnter: [delay(400)],
      onLeave: [delay(400)]
    },
    {
      path: 'contact',
      data: { component: ContactRoute },
      onEnter: [delay(400)],
      onLeave: [delay(400)]
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
        onEnter: [delay(400)],
        onLeave: [delay(400)]
      }]
    },
    {
      path: 'actors/:id',
      data: {
        component: ActorRoute,
        outlet: 'modal'
      },
      onEnter: [delay(400)],
      onLeave: [delay(400)]
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
