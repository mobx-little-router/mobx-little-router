import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { createHashHistory } from 'history'
import { install } from 'mobx-little-router'
import { RouterProvider, Outlet } from 'mobx-little-router-react'
import styled, { injectGlobal } from 'styled-components'

import { IndexRoute, AboutRoute, ContactRoute, PostRoute } from './routes'
import Header from './components/Header'

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

module.start()

window.store = module.store

class App extends Component {
  render() {
    const { location } = module.store

    return (
      <RouterProvider module={module}>
        <div>
          <Header />
          <Viewport>
            <p>pathname: <b>{JSON.stringify(location.pathname)}</b></p>

            <Outlet/>
          </Viewport>
        </div>
      </RouterProvider>
    )
  }
}

const Viewport = styled.div`
  padding: 18px;
`

injectGlobal`
  body {
    font-family: "Helvetica Neue", sans-serif;
    padding: 0;
    margin: 0;

    * {
      box-sizing: border-box;
    }
  }
`

export default observer(App)
