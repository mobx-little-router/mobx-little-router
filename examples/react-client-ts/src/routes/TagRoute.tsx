import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

export interface ITagRouteProps {
  className: string
  route: any
}

@observer
class TagRoute extends React.Component<ITagRouteProps, {}> {
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

export default TagRoute
