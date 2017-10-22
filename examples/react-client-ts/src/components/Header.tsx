import * as React from 'react'
import { Link } from 'mobx-little-router-react'
import styled from 'styled-components'

export default class Header extends React.Component {
  render() {
    return (
      <Container>
        <ul>
          <li className='title'>Basic Example</li>
          <li><Link to='/' activeClassName='active' exact={true}>Home</Link></li>
          <li><Link to='/shows?q=gundam' activeClassName='active'>Shows</Link></li>
          <li><Link to='/collections' activeClassName='active'>Collections</Link></li>
          <li><Link to='/about' activeClassName='active'>About</Link></li>
          <li><Link to='/contact' activeClassName='active'>Contact Us</Link></li>
          <li><Link to='/admin' activeClassName='active'>Admin</Link></li>
        </ul>
      </Container>
    )
  }
}

const Container = styled.div`
  position: fixed;
  z-index: 2;
  background-color: #333;
  width: 100%;
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

        &:hover {
          color: white;
        }

        &.active {
          background-color: rgb(50, 212, 212);
          color: white;
        }
      }

      &:last-child {
        margin-left: auto;
      }
    }
  }
`
