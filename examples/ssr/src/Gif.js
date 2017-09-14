import React from 'react'
import { observer, inject } from 'mobx-react'
import { withRouter } from 'mobx-little-router-react'

export default withRouter(inject('dataStore')(observer(({ dataStore, params, router }) => {
  return (
    <div>
      <h1>{`Random GIF for "${params.topic}"`}</h1>
      <img src={dataStore.randomGifs.get(params.topic)} />
      <p>
        <a href="/gif/${params.topic">{'Another?'}</a>
      </p>
    </div>
  )
})))
