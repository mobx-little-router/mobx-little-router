import React, { Component } from 'react'
import { observer } from 'mobx-react'

class AboutRoute extends Component {
  render() {
    return (
      <div>
        <h1>About</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum blandit sollicitudin cursus. Donec porta placerat bibendum. Maecenas vel massa sem. Vivamus tristique velit id ullamcorper dignissim. Nullam quis dolor lacus. Praesent elementum, nunc a auctor sollicitudin, tortor tortor auctor mi, dictum suscipit tellus diam id ipsum. Mauris lobortis neque in ultricies varius. Proin tincidunt nibh eu dignissim vulputate. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sem turpis, auctor vel tempor vel, volutpat sed neque. Fusce posuere dapibus diam, sit amet fringilla enim pulvinar nec. Nulla laoreet aliquam nisl vel elementum. Duis rhoncus commodo odio tempor scelerisque. Mauris ullamcorper elit sit amet mi egestas, in rutrum ligula porttitor. Maecenas sed dui egestas leo congue euismod vel vitae magna.</p>
        <p>Quisque gravida ex sit amet dui rhoncus, et viverra nunc porttitor. Curabitur quis diam luctus, tempor lacus vitae, auctor tortor. Vestibulum interdum neque ac turpis interdum consectetur. Sed cursus lectus diam, venenatis varius justo laoreet scelerisque. Mauris convallis suscipit neque, vel accumsan est. Etiam tincidunt commodo quam, vel luctus quam tempor sed. Quisque vel nisl eget nisl efficitur blandit gravida auctor dolor.</p>
      </div>
    )
  }
}

export default observer(AboutRoute)
