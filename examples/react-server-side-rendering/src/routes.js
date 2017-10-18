import { action } from 'mobx'
import fetch from 'node-fetch'

import Home from './Home'
import About from './About'
import AboutNotFound from './AboutNotFound'
import Gif from './Gif'
import NotFound from './NotFound'

export default [
  {
    path: '',
    match: 'full',
    getData: () => ({ component: Home })
  },
  {
    path: 'about',
    // We can handle dynamic routes on server side as well!
    loadChildren: () => Promise.resolve([
      {
        path: '',
        getData: () => ({ component: About }),
      },
      {
        path: '**',
        willActivate: (route) => {
          route.context.status = 404
          return Promise.resolve()
        },
        getData: () => ({
          component: AboutNotFound
        })
      }
    ])
  },
  {
    path: 'gif/:topic',
    getData: () => ({ component: Gif }),
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
    getData: () => ({
      component: NotFound
    })
  }
]
