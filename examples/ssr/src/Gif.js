import React from 'react'
import { observer, inject } from 'mobx-react'
import { withRouter } from 'mobx-little-router-react'

export default withRouter(inject('dataStore')(observer(({ dataStore, route, router }) => {
  return (
    <div>
      <h1>{`Random GIF for "${route.params.topic}"`}</h1>
      <img src={dataStore.randomGifs.get(route.params.topic)} />
      <p>
        <a href={`/gif/${route.params.topic}`}>{'Another?'}</a>
      </p>
    </div>
  )
})))
