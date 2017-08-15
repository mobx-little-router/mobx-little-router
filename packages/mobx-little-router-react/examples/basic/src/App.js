import React, { Component } from 'react'
import { autorun, observable, extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import { createHashHistory } from 'history'
import { install,RouterStore } from '../../../../mobx-little-router/es'
import { RouterProvider, Link } from '../../../es'

window.RouterStore = RouterStore

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
      path: 'posts',
      children: [
        {
          path: ':id',
          data: { component: Post }
        }
      ]
    }
  ]
})

module.start()

window.store = module.store

const PrintLocation = observer(({ x, location }) => {
  console.log('location', location)
  return <p>I'm at {location && location.pathname}, and x is {x}</p>
})

class App extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      x: 1
    })
  }

  render() {
    return (
      <RouterProvider module={module}>
        <div>
          <PrintLocation x={this.x} location={module.store.location} />
          <Link to="/">Index</Link>
          <Link to="/about">About</Link>
          <Link to="/posts/1">Post 1</Link>
          Hello
        </div>
      </RouterProvider>
    )
  }
}

export default App
