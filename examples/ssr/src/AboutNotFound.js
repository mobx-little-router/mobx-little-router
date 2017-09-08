const React = require('react')
const Link = require('mobx-little-router-react').Link

const h = React.createElement

module.exports = () => {
  return h('div', {
    children: [
      h('p', { children: [
        'Hmm, this section does not exist... go back to ',
        h(Link, { to: '/about' }, 'about'),
        ' page?'
      ] })
    ]
  })
}
