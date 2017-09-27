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
  { path: 'todos' },

  // This sets up an URL param.
  { path: 'todos/:id' },

  / This sets up a query dependency.
  { path: 'todos/search', query: ['q'] }
]

// ...
install({
  history: createMemoryHistory(),
  routes: ROUTES
})
```

## Child routes

Child routes can be defined *statically* or *dynamically*.

Static children:

```js
{
  path: ''
  children: [
    { path: 'a' },
    { path: 'b' },
    { path: 'c' }
  ]
}
```
Dynamic children:

```js
{
  path: ''
  loadChildren: () => Promise.resolve([
    { path: 'a' },
    { path: 'b' },
    { path: 'c' }
  ]),

  // Or in conjunction with `import(...)`
  // loadChildren: () => import('./myRoutes')
}
```

You can nest children and mix static and dynamic children in your configuration.

## Guard functions

The router supports two type of guards: **activation** and **deactivation**.

The activation guard is invoked before a route enters. It can return a `boolean` value or a `Promise<void>`.
If `false` or a rejected promise is returned then the route is blocked and navigation fails. Otherwise,
the navigation succeeds.

The deactivation guard is invoked before a route leaves. It also supports a `boolean` or `Promise<void>` return type.

This is useful for permissions checking or blocking navigation away from unsaved changes.

```js
const ROUTES = [
  // ...
  {
    path: 'todos/:id/edit',
    canActivate: (route, navigation) => {
      const { sessionStore } = route.context.stores
      if (sessionStore.current !== null) {
        return true
      } else {
        // Navigation object can be returned with `redirectTo(path)` or `goBack()`.
        return navigation.redirectTo(`/todos/${route.params.id}`)
      }
    },
    canDeactivate: (route) => {
      // Can deactivate if not dirty or user confirms discard.
      return !route.context.NewTodoStore.isDirty || confirm('Discard changes?')
    }
  }
]
```
**Note:** This example uses the context object. You can read more about context [here](./context.md).

## Resolving data and effects

The `willResolve` function will be called each time the route is entered, or a route param/query change.

```js
const ROUTES = [
  // ...
  {
    path: 'todos/:id',
    willResolve: async (route) => {
      const { todoStore } = route.context.stores
      const todo = await fetch(`/api/todos/${route.params.id}`)
      todoStore.add(todo)
    }
  },
  {
    path: 'todos/search',
    query: ['q'],
    willResolve: async (route) => {
      const { todoStore } = route.context.stores
      const todos = await fetch(`/api/todos/?q=${q}`)
      todoStore.load(todos)
    }
  }
]
```

