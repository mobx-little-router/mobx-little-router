import React, { Component } from 'react'
import { observer } from 'mobx-react'

import styled from 'styled-components'

class CollectionRoute extends Component {
  render() {
    const { className, route } = this.props

    const list = new Array(100).fill()

    return (
      <Container className={className}>
        <h1>{route.params.collectionId}</h1>
        {list.map((item, idx) => <Image key={idx}/>)}
      </Container>
    )
  }
}

class Image extends Component {
  imageRef = null

  componentDidMount() {
    setTimeout(() => {
      this.imageRef.className = this.imageRef.className + ' animate'
    })
  }

  render() {
    return (
      <CoverImage innerRef={ref => this.imageRef = ref} style={{ background: 'url("http://www.thisiscolossal.com/wp-content/uploads/2017/10/drawing-2-960x673@2x.jpg")' }} />
    )
  }
}

const Container = styled.div`
  background-color: white;
`

const CoverImage = styled.div`
  display: block;
  width: 30%;
  height: 240px;
  float: left;
  background-position: 50% 50%;
  background-size: cover;
  position: relative;
  transform: translate3d(0, 0, 0);
  margin: 10px;

  &::before {
    display: block;
    content: "";
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-image: linear-gradient(rgba(0, 255, 255, 0.4), transparent);
  }

  &::after {
    display: block;
    content: "";
    height: 100%;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    background-image: linear-gradient(transparent, rgba(255,0,0,0.4));
  }

  opacity: 0;
  transition: all 400ms ease-out;

  &.animate {
    opacity: 1;
  }
`

export default observer(CollectionRoute)
