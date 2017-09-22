# Configuration

The route configuration is the `routes` option when calling the [`install`](./installation.md) function.
It is defined as follows.

```js
type Config = {
  path: string,
  children?: Config[],
  query?: string[],
  redirectTo?: string,
  getData?: Function,
  canActivate?: Function,
  canDeactivate?: Function,
  willResolve?: Function,
  onError?: Function,
  onTransition?: Function
}
```

At minimum, you need to specify the `path`, which corresponds to the URL segment(s) that this route will match.

e.g.

```js
const ROUTES = [
  { path: '' }
  { path: 'shows',
    children: [
      { path: ':id' }
    ]
  },
  { path: 'about' }
]

// ...
install({
  history: createMemoryHistory(),
  routes: ROUTES
})
```

## Dynamic routes

Child routes can be specified using `loadChildren` instead of `children`. The value of `loadChildren` is a
function that returns a promise of child routes.

```js
{
  path: ''
  loadChildren: () => Promise.resolve([
    { path: 'a' },
    { path: 'b' },
    { path: 'c' }
  ])
}
```

You can use this in conjunction with `import(...)`.

```js
{
  path: '',
  loadChildren: () => import('./myRoutes')
}
```
