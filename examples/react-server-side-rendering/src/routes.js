import { action } from 'mobx'
import fetch from 'node-fetch'

import Home from './pages/Home'
import About from './pages/About'
import AboutNotFound from './pages/AboutNotFound'
import Gif from './pages/Gif'
import NotFound from './pages/NotFound'

export default [
  {
    path: '',
    match: 'full',
    component: Home
  },
  {
    path: 'about',
    // We can handle dynamic routes on server side as well!
    loadChildren: () => Promise.resolve([
      {
        path: '',
        component: About,
      },
      {
        path: '**',
        willActivate: (route) => {
          route.context.status = 404
          return Promise.resolve()
        },
        component: AboutNotFound
      }
    ])
  },
  {
    path: 'gif/:topic',
    component: Gif,
    willActivate: (route) => {
      return new Promise(res => {
        const topic = route.params.topic
        const dataStore = route.context.dataStore
        fetch(`https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&topic=${topic}`)
          .then(x => x.json())
          .then(json => {
            dataStore.randomGifs.set(topic, json.data.image_original_url)
            res()
          })
          .catch(() => {
            console.error('Oh noes!')
            res()
          })
      })
    }
  },
  {
    path: 'g/:topic',
    redirectTo: '/gif/:topic',
    willActivate: (route) => {
      route.context.status = 302
      return Promise.resolve()
    },
  },
  {
    path: '**',
    willActivate: action((route) => {
      route.context.status = 404
      return Promise.resolve()
    }),
    component: NotFound
  }
]
