import React, { Component } from 'react'
import { observer } from 'mobx-react'

class AboutRoute extends Component {
  render() {
    return (
      <div>
        <h1>Home</h1>
        <p>Navigate to some other other sections</p>
      </div>
    )
  }
}

export default observer(AboutRoute)
