import React, { Component } from 'react'
import { Link } from 'mobx-little-router-react'
import styled from 'styled-components'
import cx from 'classnames'

export default class Header extends Component {
  render() {
    return (
      <Container>
        <ul>
          <li className="title">Basic Example</li>
          <li><Link to="/" activeClassName="active" exact={true}>Home</Link></li>
          <li><Link to="/about" activeClassName="active">About</Link></li>
        </ul>
      </Container>
    )
  }
}

const Container = styled.div`
  background-color: #333;
  height: 54px;
  line-height: 54px;

  ul {
    list-style: none;
    display: flex;
    flex-direction: row;
    padding: 0;
    margin: 0;

    li {
      &.title {
        background-color: rgb(212, 212, 50);
        padding: 0 18px;
        color: white;
      }

      a {
        display: block;
        padding: 0 18px;
        color: #ccc;
        text-decoration: none;
        font-size: 14px;

        &.active, &:hover {
          background-color: rgb(50, 212, 212);
          color: white;
        }
      }
    }
  }
`