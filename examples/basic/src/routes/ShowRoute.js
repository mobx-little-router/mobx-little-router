import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled from 'styled-components'
import { Link } from 'mobx-little-router-react'

class ShowRoute extends Component {
  constructor(props) {
    super(props)

    extendObservable(this, {
      model: null
    })
  }

  componentDidMount = async () => {
    const { params } = this.props

    const res = await fetch(`https://api.tvmaze.com/shows/${params.id}`)
    const data = await res.json()

    this.model = data
  }

  render() {
    if (this.model) {
      return (
        <Container>
          <CoverImage src={this.model.image.original} />
          <Abstract>
            <ShowType>{this.model.type}</ShowType>
            <Title>{this.model.name}</Title>
            <Summary dangerouslySetInnerHTML={{ __html: this.model.summary }} />
            <Tags>{this.model.genres.map(genre => <Link to={`/tags/${genre}`}>#{genre}</Link>)}</Tags>
          </Abstract>
        </Container>
      )
    } else {
      return null
    }
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 auto;
  width: 100%;
  max-width: 900px;
`

const CoverImage = styled.img`
  flex: 1;
  display: block;
  width: 50%;
`

const Abstract = styled.div`
  margin-left: 18px;
  flex: 1;
`
const Title = styled.h1`
  color: #333;
  margin: 0 0 18px;
`

const Summary = styled.p`
  color: #999;
`

const ShowType = styled.div`
  text-transform: uppercase;
  color: #978;
  font-size: 12px;
`

const Tags = styled.div`
  margin: 9px 0;

  > a {
    font-size: 12px;
    color: #079;
    margin-right: 9px;
  }
`

export default observer(ShowRoute)
