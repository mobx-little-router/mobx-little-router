import React, { Component } from 'react'
import { autorun, observable, extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import { createHashHistory } from 'history'
import { install, RouterStore } from 'mobx-little-router'
import { RouterProvider, Link } from 'mobx-little-router-react'
import styled, { injectGlobal } from 'styled-components'

import Header from './components/Header'

const Index = () => <div>Index</div>

const About = () => <div>About</div>

const Post = () => <div>I'm a post</div>

window.autorun = autorun

const module = install({
  createHistory: createHashHistory,
  routes: [
    { path: '', data: { component: Index } },
    { path: 'about', data: { component: About } },
    {
      path: 'posts/:id',
      data: { component: Post }
    }
  ]
})

module.start()

window.store = module.store

class App extends Component {
  collection = observable([])

  componentDidMount = async () => {
    const res = await fetch('https://api.tvmaze.com/search/shows?q=batman')
    const data = await res.json()

    data.forEach(({ show }) => this.collection.push(show))
  }

  render() {
    const { location } = module.store
    return (
      <RouterProvider module={module}>
        <div>
          <Header />
          <p>pathname = {JSON.stringify(location.pathname)}</p>
          <ul>
            {this.collection.map(show =>
              <li key={show.id}>
                <Link to={`/posts/${show.id}`}>{show.name}</Link>
              </li>
            )}
          </ul>
        </div>
      </RouterProvider>
    )
  }
}

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
