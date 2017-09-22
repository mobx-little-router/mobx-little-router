import React, { Component } from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

class TagRoute extends Component {
  render() {
    const { route: { params }, className } = this.props
    
    return (
      <Container className={className}>
        <h1>{params.tag}</h1>
      </Container>
    )
  }
}

const Container = styled.div`
`

export default observer(TagRoute)
