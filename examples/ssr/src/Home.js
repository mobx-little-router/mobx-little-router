const React = require('react')

const h = React.createElement

module.exports = () => {
  return h('div', {
    children: [
      h('h1', {}, 'Home'),
      h('p', {}, 'Welcome to the SSR, example!'),
      h('p', {
        children: [
          'If you want to see the source code, please check out the project ',
          h(
            'a',
            {
              href:
                'https://github.com/mobx-little-router/mobx-little-router/examples/ssr'
            },
            'repository'
          ),
          '.'
        ]
      })
    ]
  })
}
