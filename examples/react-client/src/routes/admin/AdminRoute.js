import React, { Component } from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

class AdminRoute extends Component {
  render() {
    const { className } = this.props

    return (
      <Container className={className}>
        <h1>Admin</h1>
        <p>This is a protected admin route.</p>
        <p>You should not be able to see this unless you are authenticated</p>
      </Container>
    )
  }
}

const Container = styled.div`
`

export default observer(AdminRoute)
