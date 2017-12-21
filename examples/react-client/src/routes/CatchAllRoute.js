import React, { Component } from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import { withRouter } from 'mobx-little-router-react'

class CatchAllRoute extends Component {
  render() {
    const { router: { error } } = this.props

    return (
      <Container>
        <ErrorMessage>{error.message}</ErrorMessage>
      </Container>
    )
  }
}

const Container = styled.div`
`

const ErrorMessage = styled.div`
`

export default withRouter(observer(CatchAllRoute))
