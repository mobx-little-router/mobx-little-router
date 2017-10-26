# React server-side rendering (SSR) and code-splitting example

This example shows off the Router's ability to render in both the server and client environments.

The main idea for SSR is that the router can resolving data and dynamic children in one pass, so we
only need to await `router.start()` before rendering the application.

Code-splitting using `import()` is handled by webpack, but you can also swap out `import()` with any
promise-returning function. e.g. `loadChildren: () => Promise.resolve([...])`

## Running the app

Build:

```
yarn build
```

Run server:

```
yarn start
```

Note, dev server, hot-reloading, etc. are not provided. They can be set up with more work.
