# mobx-little-router

This package provides the core functionality of the MobX little router.

## Getting Started

Import the `install` function from package, along with your chosen history creator from `history` package.

```js
import { install } from 'mobx-little-router'
import { createMemoryHistory } from 'history'

const ROUTES = [{ path: ':whatever' }]

const router = install({
  history: createMemoryHistory(),
  routes: ROUTES
})
```

Then run `router.start(...)` which takes in a callback when initialization finishes.

```js
import { autorun } from 'mobx'

router.start(() => {
  autorun(() => console.log(`path = ${router.store.location.pathname}`))

  router.push('/a') // Prints "path = /a/"
  router.push('/b') // Prints "path = /b/"
  router.push('/c') // Prints "path = /c/"

  router.push('/not/found') // Navigation aborts since path cannot be matched from config.
})
```

### Install options

The `install` function takes the following options:

- `history` - The history object created from [`history`](https://github.com/ReactTraining/history/).
- `getContext` - A function that returns a context object that is accessible from each route. This is useful for
  sharing MobX stores or other injectable objects.
- `middleware` - Custom router middleware for your application.
- `routes` - A list of initial route configuration of type `Config[]`, where

  ```js
  type Config = {
    path: string,

    // Static child routes.
    children?: Config[],

    // Dynamic child routes
    loadChildren?: () => Promise<Config[]>,

    // Guard functions that can block a route from activating or deactivating.
    canActivate?: (route: Route<*, *>) => boolean | Promise<void>,
    canDeactivate?: (route: Route<*, *>) => boolean | Promise<void>,

    // Called for each activation or query/param changes to the route.
    // Used for resolving effects.
    willResolve?: (route: Route<*, *>) => Promise<void>,

    onTransition?: (evt: TransitionEvent) => Promise<void>
  }
  ```

  For more type information, check out the [`routing/types.js`](./src/model/types.js)
  file.

### Dynamic children

Dynamically loaded children is useful when combined with lazy loading.

```js
const ROUTES = [
  { path: 'todos', loadChildren: () => import('./todos/routes') }
]

// ./todos/routes.js
export default [
 { path: ':id',
  children: [
   { path: 'edit' }
  ]
 },
]
```

## Documentation

- [Introduction](./docs/intro/README.md)
- [Basics](./docs/basics/README.md)
- [Advanced](./docs/advanced/README.md)
