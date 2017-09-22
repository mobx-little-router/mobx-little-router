import express from 'express'
import React from 'react'
import ReactDOM from 'react-dom/server'
import { createMemoryHistory } from 'history'
import { install } from 'mobx-little-router-react'
import App from './src/App'
import routes from './src/routes'
import DataStore from './src/DataStore'

const app = express()

app.get('*', (req, res) => {
  const dataStore = new DataStore()
  const ctx = {
    status: 200,
    dataStore: dataStore
  }
  const router = install({
    history: createMemoryHistory({ initialEntries: [req.url] }),
    routes,
    getContext: () => ctx
  })

  router.start(() => {
    const html = ReactDOM.renderToString(
      <App dataStore={dataStore} router={router} />
    )

    if (ctx.status > 300 && ctx.status < 400) {
      res.redirect(ctx.status, router.store.location.pathname)
    } else {
      res.status(ctx.status).send(html)
    }
  })
})

app.listen(3000, () => {
  console.log('SSR example listening on port 3000!')
})
