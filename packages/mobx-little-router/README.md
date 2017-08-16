# mobx-little-router

This package provides the core functionality of the MobX little router.

## Usage

Import the `install` function from package, along with your chosen history creator from `history` package.

```js
import { install } from 'mobx-little-router'
import { createMemoryHistory } from 'history'

const ROUTES = [{ path: ':whatever' }]

const router = install({
  createHistory: createMemoryHistory,
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

- `createHistory` - The history creator function from `history` (e.g. `createBrowserHistory`,
  `createHashHistory`, `createMemoryHistory`).
- `routes` - A list of initial route configuration of type `Config[]`, where

  ```
  type Config = {
    path: string,
    data?: Object,
    children?: Config[],
    loadChildren?: () => Promise<Config[]>
    canActivate?: (node, params) => Promise<void>
    onEnter?: (node, params) => Promise<void>
    onLeave?: (node, params) => Promise<void>
    canDeactivate?: (node, params) => Promise<void>
    onError?: (node, params) => Promise<void>
  }
  ```

  For more type information, check out the [`routing/types.js`](./src/routing/types.js)
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

## Design

This router stores all of the routing data inside of a single store class, which contains
`@observable` properties that leverages MobX's change detection system.

This package is split into three separate concerns.

1. **Routing information**

  The routing information is stored inside of the `RouterStore` class. It contains
  an observable `null | string` value for the current `location`, as well as a state
  tree (`RouterStateTree`) that captures the current state of the application.

  The store class provides query methods and mutations methods. It's only side-effect
  is causing any potential reactions whenever its own state changes. The store never
  directly communicates with the rest of the application.

  Note: Location `pathname` is always normalized to end with a trailing `/`.

2. **Scheduling**

  The `Scheduler` class handles all incoming navigation requests. Each request is processed
  in order, and all lifecycle hooks (`canActivate`, `canDeactivate`, etc.) are executed
  on each route node. If a lifecycle hook is rejected on any one node, then the navigation
  is cancelled altogether.

3. **History management**

  Coordinates history events and transitions, and passes the requests down to the `Scheduler`.
