import React from 'react'
import ReactDOM from 'react-dom'
import { createBrowserHistory } from 'history'
import { install } from 'mobx-little-router-react'
import App from './App'
import homeRoutes from './routes/home/index'
import DataStore from './DataStore'

const dataStore = new DataStore()
const ctx = {
  status: 200,
  dataStore: dataStore
}
const router = install({
  history: createBrowserHistory(),
  routes: homeRoutes,
  getContext: () => ctx
})

router.start(() => {
  ReactDOM.hydrate(
    <App dataStore={dataStore} router={router} />,
    document.getElementById('root')
  )
})
