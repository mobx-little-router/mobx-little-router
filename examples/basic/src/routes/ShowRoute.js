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

  componentDidMount() {
    this.fetchModel(this.props)
  }

  componentWillReceiveProps(props) {
    this.fetchModel(props)
  }

  fetchModel = async (props) => {
    const { params } = props

    const res = await fetch(`https://api.tvmaze.com/shows/${params.id}`)
    const data = await res.json()

    this.model = data
  }

  render() {
    if (this.model) {
      return (
        <Overlay>
          <Container>
            <CloseButton to="/" />
            <CoverImage style={{ backgroundImage: `url(${this.model.image.original})` }} />
            <Abstract>
              <ShowType>{this.model.type}</ShowType>
              <Title>{this.model.name}</Title>
              <Summary dangerouslySetInnerHTML={{ __html: this.model.summary }} />
              <Tags>{this.model.genres.map((genre, idx) => <Link key={idx} to={`/tags/${genre}`}>{genre}</Link>)}</Tags>
            </Abstract>
          </Container>
        </Overlay>
      )
    } else {
      return null
    }
  }
}

const Container = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  display: flex;
  flex-direction: row;
  max-width: 900px;
  background-color: white;
  width: 80%;
  height: 600px;
  border-radius: 2px;
  box-shadow: 0 1px 4px 1px rgba(0,0,0,0.5);
  overflow: hidden;
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.8);
`

const CloseButton = styled(Link)`
  position: absolute;
  right: 0;
  top: 0;
  text-decoration: none;
  font-size: 23px;
  color: #333;
  margin: 9px;

  &:hover {
    opacity: 0.7;
  }

  &::after {
    cursor: pointer;
    content: "✕";
    display: block;
    width: 36px;
    height: 36px;
    line-height: 36px;
    text-align: center;
  }
`

const CoverImage = styled.div`
  flex: 1;
  display: block;
  width: 50%;
  background-position: 50% 50%;
  background-size: cover;
  position: relative;

  &::before {
    display: block;
    content: "";
    height: 5px;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-image: linear-gradient(rgba(255, 255, 255, 0.4), transparent);
  }

  &::after {
    display: block;
    content: "";
    height: 5px;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    background-image: linear-gradient(transparent, rgba(0,0,0,0.4));
  }
`

const Abstract = styled.div`
  margin: 72px 36px 0;
  flex: 1;
  width: 50%;
`

const Title = styled.h1`
  color: #333;
  margin: 0 0 18px;
`

const Summary = styled.p`
  color: #666;
  line-height: 18px;
  font-size: 13px;
`

const ShowType = styled.div`
  text-transform: uppercase;
  color: #aaa;
  font-size: 12px;
`

const Tags = styled.div`
  margin: 9px 0;

  > a {
    font-size: 12px;
    color: #079;
    margin-right: 9px;
    display: inline-block;
    text-decoration: none;
    border-radius: 9px;
    background-color: #eee;
    padding: 0 9px;
    line-height: 18px;
    color: #999;
  }
`

export default observer(ShowRoute)
