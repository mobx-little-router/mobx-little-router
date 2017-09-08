const React = require('react')
const Outlet = require('mobx-little-router-react').Outlet

const h = React.createElement

module.exports = () => {
  return h('div', {
    children: [
      h('h1', {}, 'About'),
      h('p', {}, 'This is the about page...'),
      h(Outlet)
    ]
  })
}
