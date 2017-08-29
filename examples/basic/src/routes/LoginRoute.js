import React, { Component } from 'react'
import { observer } from 'mobx-react'

import styled from 'styled-components'

class LoginRoute extends Component {
  render() {
    const { className } = this.props

    return (
      <Container className={className}>
        <h1>Login</h1>
      </Container>
    )
  }
}

const Container = styled.div`
`

export default observer(LoginRoute)
