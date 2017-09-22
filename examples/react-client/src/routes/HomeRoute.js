import React, { Component } from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

class HomeRoute extends Component {
  render() {
    const { className } = this.props

    return (
      <Container className={className}>
        <h1>Home</h1>
        <p>Navigate to some other other sections</p>
      </Container>
    )
  }
}

const Container = styled.div`
`

export default observer(HomeRoute)
