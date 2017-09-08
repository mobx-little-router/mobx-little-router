const Home = require('./Home')
const About = require('./About')
const AboutNotFound = require('./AboutNotFound')
const Gif = require('./Gif')
const NotFound = require('./NotFound')
const mobx = require('mobx')
const fetch = require('node-fetch')

module.exports = [
  {
    path: '',
    match: 'full',
    getData: () => ({ component: Home })
  },
  {
    path: 'about',
    getData: () => ({ component: About }),
    children: [
      {
        path: '',
        getData: () => ({
          component: () => null
        })
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
    ]
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
    path: '**',
    willActivate: mobx.action((route) => {
      route.context.status = 404
      return Promise.resolve()
    }),
    getData: () => ({
      component: NotFound
    })
  }
]
