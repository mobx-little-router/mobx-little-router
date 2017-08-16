import React, { Component } from 'react'
import { observer } from 'mobx-react'

class ShowRoute extends Component {
  render() {
    return (
      <div>
        <h1>Show</h1>
      </div>
    )
  }
}

export default observer(ShowRoute)
