const React = require('react')

const h = React.createElement

module.exports = () => {
  return h('div', {
    children: [
      h('h1', {}, 'About'),
      h('p', {}, 'This is the about page...')
    ]
  })
}
