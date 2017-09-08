const React = require('react')

const h = React.createElement

module.exports = () => {
  return h('div', {
    children: [
      h('h1', {}, 'Not Found'),
      h('p', {}, "This is not the page you're looking for")
    ]
  })
}
