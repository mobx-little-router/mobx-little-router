import React, { Component } from 'react'
import { runInAction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { withRouter } from 'mobx-little-router-react'

import styled from 'styled-components'

class LoginRoute extends Component {
  login = () => {
    const { SessionStore, router } = this.props
    
    runInAction(() => {
      SessionStore.isAuthenticated = true
      router.push(SessionStore.unauthorizedNavigation.to)
    })
  }

  render() {
    const { className } = this.props

    return (
      <Container className={className}>
        <div><input type="text" placeholder="Email"/></div>
        <div><input type="password" placeholder="Password"/></div>
        <div><button onClick={this.login}>Login</button></div>
      </Container>
    )
  }
}

const Container = styled.div`
`

export default withRouter(inject('SessionStore')(observer(LoginRoute)))
