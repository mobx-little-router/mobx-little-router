# Middleware

The middleware is supported by providing an `middleware` object to the `install` function.

```js
import { Middleware, install } from 'mobx-little-router'
const router = {
  middleware: Middleware(evt => evt),
  // ...
}
```

Each [event](./events.md) dispatched through the system will pass through the middleware chain. The middleware
can add additional data or change the dispatch event entirely.

For example, here is a middleware that cancels every navigation -- not very useful of course.

```js
import { EventTypes } from 'mobx-little-router'
Middleware(evt => ({
  ...evt,
  type: EventTypes.NAVIGATION_CANCELLED
})
```

## Combining middlewares

Middleware objects can be combined using the `concat` method.

```js
const a = Middleware(evt => { /* ... */ })
const b = Middleware(evt => { /* ... */ })
const c = Middleware(evt => { /* ... */ })
const combined = a.concat(b).concat(c)
```

This will flow the data from right-to-left. Meaning that the above configuration will
pass through `a`, then `b`, and finally through `c`.

Alternatively, you can use the `pipe` or `compose` functions.

```js
import { compose, pipe } from 'mobx-little-router'
// This...
let combined = compose(c, b, a)
// is the same as...
combined = pipe(a, b, c)
```

The `compose` function is left-to-right, and `pipe` is right-to-left.

Some of the internal routing features are handled through middlewares, such as parsing the query object (See
[withQueryMiddleware](/packages/mobx-little-router/src/middleware/withQueryMiddleware.js)).
