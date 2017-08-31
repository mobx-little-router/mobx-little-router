const Home = require('./Home')
const About = require('./About')
const Gif = require('./Gif')
const fetch = require('node-fetch')

module.exports = [
  {
    path: '',
    match: 'full',
    getData: () => ({ component: Home })
  },
  {
    path: 'about',
    getData: () => ({ component: About })
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
  }
]
