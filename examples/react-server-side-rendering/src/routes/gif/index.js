import { action } from 'mobx'
import fetch from 'node-fetch'
import Gif from '../gif/Gif'

export default [
  {
    path: ':topic',
    component: Gif,
    willActivate: route => {
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
