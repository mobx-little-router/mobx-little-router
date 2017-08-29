import React, { Component } from 'react'
import { Provider, observer } from 'mobx-react'
import { withRouter, Outlet } from 'mobx-little-router-react'
import styled, { injectGlobal } from 'styled-components'
import Header from './components/Header'
import * as stores from './stores'

class App extends Component {
  render() {
    return (
      <Provider {...stores}>
        <div>
          <Header />
          <Viewport>
            <p>pathname: <b>{JSON.stringify(this.props.router.store.location.pathname)}</b></p>
            <Outlet />
            <Outlet name="modal" />
          </Viewport>
        </div>
      </Provider>
    )
  }
}

const Viewport = styled.div`
  padding: 54px 18px;
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

  input:focus,
  select:focus,
  textarea:focus,
  button:focus {
    outline: none;
  }
`

export default withRouter(observer(App))
