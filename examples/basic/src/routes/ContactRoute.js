import React, { Component } from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

class ContactRoute extends Component {
  render() {
    const { className } = this.props

    return (
      <Container className={className} data-transition-ref>
        <h1>Contact Us</h1>
        <p>
          Example Inc.,<br/>
          123 King St.<br/>
          Suite 100<br/>
          Toronto, ON<br/>
          Canada
        </p>
        <p>
          Telephone: (555) 555-5555<br/>
          Fax: (555) 555-5555<br/>
          Email: <a href="mailto:info@example.com">info@example.com</a>
        </p>
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

export default observer(ContactRoute)
