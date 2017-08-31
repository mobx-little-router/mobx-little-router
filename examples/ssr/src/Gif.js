const React = require('react')
const MobxReact = require('mobx-react')
const RouterReact = require('mobx-little-router-react')

const h = React.createElement

module.exports = RouterReact.withRouter(MobxReact.inject('dataStore')(MobxReact.observer(
  ({ dataStore, params, router }) => {
    return h('div', {
      children: [
        h('h1', {}, `Random GIF for "${params.topic}"`),
        h('img', { src: dataStore.randomGifs.get(params.topic) }),
        h('p', {}, h('a', { href: `/gif/${params.topic}` }, 'Another?'))
      ]
    })
  }
)))
