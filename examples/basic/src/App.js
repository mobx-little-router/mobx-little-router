import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { install } from 'mobx-little-router'
import { Link, Outlet } from 'mobx-little-router-react'
import styled, { injectGlobal } from 'styled-components'
import { IndexRoute, AboutRoute, ContactRoute, PostRoute } from './routes'
import Header from './components/Header'


class App extends Component {
  render() {
    // const { location } = module.store

    return (
      <div>
        <Header />
        <Viewport>
          {/*<p>pathname: <b>{JSON.stringify(location.pathname)}</b></p>*/}
          <Outlet />
        </Viewport>
      </div>
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
