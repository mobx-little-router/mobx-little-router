import React from 'react'
import ReactDOM from 'react-dom'
import { createBrowserHistory } from 'history'
import { install } from 'mobx-little-router-react'
import App from './src/App'
import routes from './src/routes'
import DataStore from './src/DataStore'

const dataStore = new DataStore()
const ctx = {
  status: 200,
  dataStore: dataStore
}
const router = install({
  history: createBrowserHistory(),
  routes,
  getContext: () => ctx
})

router.start(() => {
  ReactDOM.hydrate(
    <App dataStore={dataStore} router={router} />,
    document.getElementById('root')
  )
})
