import React, { Component } from 'react'
import { observer } from 'mobx-react'

class TagRoute extends Component {
  render() {
    const { params } = this.props
    return (
      <div>
        <h1>{params.tag}</h1>
      </div>
    )
  }
}

export default observer(TagRoute)
