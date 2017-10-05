# mobx-router-react

## Usage

```js
  import React from 'react'
  import ReactDOM from 'react-dom'
  import { createBrowserHistory } from 'history'
  import { install, RouterProvider, Outlet } from 'mobx-little-router-react'
  import { install } from 'mobx-little-router-react'

  // Note that <Outlet/> is rendered at the App component level.
  // This will allow any matched child route to also be rendered.
  // If you need to block child rendering you can do that by not rendering
  // the <Outlet/> element.
  const App = () => (
    <div>
      <header>Acme Inc.</header>
      <Outlet/>
    </div>
  )

  const Home = () => (
    <div>
      <h1>Home</h1>
    </div>
  )

  const About = () => (
    <div>
      <h1>About</h1>
    </div>
  )

  install({
    history: createBrowserHistory(),
    routes: [
      { path: '', component: Home },
      { path: 'about', component: About }
    ]
  })

  router.start(() => {
    ReactDOM.render(
      <RouterProvider router={router}>
        <App />
      </RouterProvider>,
      document.getElementById('root')
    )
  })
```

## Components

#### RouterProvider

Provides the router context

#### Link

Used to navigate

#### Outlet

Used to render routes at each depth.

## Decorators

#### withRouter

injects router context into component props.

## Configuration

`component` ReactComponent

A react component to render when the route is matched

`outlet` string

An optional *named* outlet to render this route into, ie. 'modal'

`animate` boolean, default: false

Do you wish to use built in animation features for this route. Specify a `data-transition-ref` attribute on the node you are animating otherwise the Component root node will be used for detecting the `transitionend` event.  

