// @flow
import React, { Component } from 'react'
import { RouterType } from '../components/propTypes'

export default function withRouter(Cmp: ReactClass<*>): ReactClass<*> {
  class Wrapped extends Component {
    static contextTypes = {
      router: RouterType
    }

    render() {
      return <Cmp router={this.context.router} {...this.props}/>
    }
  }

  return Wrapped
}
