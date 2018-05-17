import React, { Component } from 'react'
import { Link, Outlet } from 'mobx-little-router-react'
import { observer } from 'mobx-react'

import styled from 'styled-components'

class CollectionsRoute extends Component {
  render() {
    const { className } = this.props

    return (
      <Container className={className}>
        <ul>
          <li><Link to="/collections/a" activeClassName="active">A</Link></li>
          <li><Link to="/collections/b" activeClassName="active">B</Link></li>
          <li><Link to="/collections/c" activeClassName="active">C</Link></li>
          <li><Link to="/collections/d" activeClassName="active">D</Link></li>
        </ul>

        <Outlet/>
      </Container>
    )
  }
}

const Container = styled.div`
  background-color: white;

  > ul {
    list-style: none;
    margin: 0;
    padding: 0;
    
    li {
      display: inline-block;
      width: 45px;
      height: 45px;
      line-height: 45px;
      a {
        display: block;
        width: 100%;
        height: 100%;
        text-align: center;
        border-bottom: 1px solid #ccc;
        color: #999;
        text-decoration: none;

        &:hover {
          color: #333;
        }

        &.active {
          border-bottom: 2px solid #333;
        }
      }
    }
  }
`

export default observer(CollectionsRoute)
