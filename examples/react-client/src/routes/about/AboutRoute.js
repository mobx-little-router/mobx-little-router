import React, { Component } from 'react'
import { observer } from 'mobx-react'

import styled from 'styled-components'

class AboutRoute extends Component {
  render() {
    const { className } = this.props

    return (
      <Container className={className} data-transition-ref>
        <h1>About</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum blandit sollicitudin cursus. Donec porta placerat bibendum. Maecenas vel massa sem. Vivamus tristique velit id ullamcorper dignissim. Nullam quis dolor lacus. Praesent elementum, nunc a auctor sollicitudin, tortor tortor auctor mi, dictum suscipit tellus diam id ipsum. Mauris lobortis neque in ultricies varius. Proin tincidunt nibh eu dignissim vulputate. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sem turpis, auctor vel tempor vel, volutpat sed neque. Fusce posuere dapibus diam, sit amet fringilla enim pulvinar nec. Nulla laoreet aliquam nisl vel elementum. Duis rhoncus commodo odio tempor scelerisque. Mauris ullamcorper elit sit amet mi egestas, in rutrum ligula porttitor. Maecenas sed dui egestas leo congue euismod vel vitae magna.</p>
        <p>Quisque gravida ex sit amet dui rhoncus, et viverra nunc porttitor. Curabitur quis diam luctus, tempor lacus vitae, auctor tortor. Vestibulum interdum neque ac turpis interdum consectetur. Sed cursus lectus diam, venenatis varius justo laoreet scelerisque. Mauris convallis suscipit neque, vel accumsan est. Etiam tincidunt commodo quam, vel luctus quam tempor sed. Quisque vel nisl eget nisl efficitur blandit gravida auctor dolor.</p>
      </Container>
    )
  }
}

const Container = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  background-color: white;
  z-index: 1;
  top: 90px;

  &.enter {
    transition: transform 400ms ease-out;
    transform: translateX(100%);

    &.enter-active {
      transform: translateX(0);
    }
  }

  &.exit {
    transition: transform 400ms ease-out;
    transform: translateX(0);

    &.exit-active {
      transform: translateX(-100%);
    }
  }
`

export default observer(AboutRoute)
