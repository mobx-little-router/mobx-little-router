import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import { Link } from 'mobx-little-router-react'

class IndexRoute extends Component {
  collection = observable([])

  componentDidMount = async () => {
    const res = await fetch('https://api.tvmaze.com/search/shows?q=batman')
    const data = await res.json()

    data.forEach(({ show }) => this.collection.push(show))
  }

  render() {
    return (
      <div>
        <h1>Index</h1>
        <ul>
          {this.collection.map(show =>
            <li key={show.id}>
              <Link to={`/posts/${show.id}`}>{show.name}</Link>
            </li>
          )}
        </ul>
      </div>
    )
  }
}

export default observer(IndexRoute)
