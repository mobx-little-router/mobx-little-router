# Installation

The router provides an `install` function that requires two things.

1. A `history` object. See the [history module](https://github.com/ReactTraining/history).
1. An array of route configurations. Must contain `path`, and optionally `children`.

```js
import { createHashHistory } from 'history'
import { install } from 'mobx-little-router'

 router = install({
  history: createMemoryHistory(),
  routes: [
  { path: '' },
  {
    path: 'about',
    children: [{ path: 'contact' }]
  },
  { path: 'contact', redirectTo: '/about/contact' },
  { path: '**' }
]
})
```

You can then start and stop the router.

```js
import { reaction } from 'mobx'

// ...

reaction(
  () => router.store.location.pathname,
  pathname => console.log(`pathname = ${pathname}`)
)

router.start(() => {
  // Push some routes.
  router.push('/')
    .then(() => router.push('/about'))
    .then(() => router.push('/contact'))
    .then(() => router.push('/404'))
    .then(() => router.stop())

  // You should see this logged.
  // pathname = /
  // pathname = /about/
  // pathname = /about/contact/
  // pathname = /404/
})
```
