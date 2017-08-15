import React, { Component } from 'react'
import { autorun, observable, extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import { createHashHistory } from 'history'
import { install, RouterStore } from 'mobx-little-router'
import { RouterProvider, Link } from 'mobx-little-router-react'

const Index = () => <div>Index</div>

const About = () => <div>About</div>

const Post = () => <div>I'm a post</div>

window.autorun = autorun

const module = install({
  createHistory: createHashHistory,
  routes: [
    { path: '', data: { component: Index } },
    { path: 'about', data: { component: About } },
    { path: 'asd', data: { component: About } },
    {
      path: 'posts/:id',
      data: { component: Post }
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
          <p>pathname = {JSON.stringify(location.pathname)}</p>
          <Link to="/">Index</Link>
          <Link to="/about">About</Link>
          <Link to="/asd">asd</Link>
          <Link to="/posts/1">Post 1</Link>
          Hello
        </div>
      </RouterProvider>
    )
  }
}

export default observer(App)
