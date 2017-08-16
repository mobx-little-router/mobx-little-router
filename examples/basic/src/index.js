import React from 'react'
import * as mobx from 'mobx'
import ReactDOM from 'react-dom'
import { createHashHistory } from 'history'
import { install } from 'mobx-little-router'
import { RouterProvider } from 'mobx-little-router-react'

import { IndexRoute, AboutRoute, ContactRoute, PostRoute } from './routes'
import App from './App'

const Index = () => <div>Index</div>

const About = () => <div>About</div>

const Post = () => <div>I'm a post</div>

const module = install({
  createHistory: createHashHistory,
  routes: [
    { path: '', data: { component: IndexRoute } },
    { path: 'about', data: { component: AboutRoute } },
    { path: 'contact', data: { component: ContactRoute } },
    {
      path: 'posts/:id',
      data: { component: PostRoute }
    }
  ]
})

window.store = module.store
window.mobx = mobx

module.start().then(() => {
  ReactDOM.render(
    <RouterProvider module={module}>
      <App />
    </RouterProvider>,
    document.getElementById('root')
  )
})
