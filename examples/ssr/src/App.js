const React = require('react')
const RouterReact = require('mobx-little-router-react')
const MobxReact = require('mobx-react')

const h = React.createElement

module.exports = ({ router, dataStore }) => {
  return h(
    MobxReact.Provider,
    { dataStore: dataStore },
    h(
      RouterReact.RouterProvider,
      {
        router: router
      },
      h('div', {
        style: { display: 'flex' },
        children: [
          h('ul', {
            style: { minWidth: '100px', maxWidth: '200px' },
            children: [
              h('li', {}, h(RouterReact.Link, { to: '/' }, 'Home')),
              h('li', {}, h(RouterReact.Link, { to: '/about' }, 'About')),
              h('li', {}, h(RouterReact.Link, { to: '/gif/cat' }, 'Cat GIF')),
              h('li', {}, h(RouterReact.Link, { to: '/gif/dog' }, 'Dog GIF'))
            ]
          }),
          h('div', { style: { flex: 1 } }, h(RouterReact.Outlet))
        ]
      })
    )
  )
}
