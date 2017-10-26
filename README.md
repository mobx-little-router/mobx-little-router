# MobX Little Router

[![](https://codecov.io/gh/mobx-little-router/mobx-little-router/branch/master/graph/badge.svg)](https://codecov.io/gh/mobx-little-router/mobx-little-router)
[![](https://api.travis-ci.org/mobx-little-router/mobx-little-router.svg?branch=master)](https://travis-ci.org/mobx-little-router/mobx-little-router)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

A view-agnostic router that uses [MobX](https://mobx.js.org/) to manage its internal state. Built
to handle the complex requirements of modern-day, universal web applications.

## Why?

Our development team use [MobX](https://mobx.js.org) as the state management library for most of our
applications.

Routing has become increasingly complex in recent times, and we believe that routing libraries should
be updated to reflect this reality. We've tried several existing routers in the React + MobX ecosystem, but
none has met our requirements or functioned exactly the way we want it to. And so we built our own router.

Here are what you get from `mobx-little-router` out of the box.

- Static type support for Flow.

- *State management* and *change detection* that lives completely within MobX. This means you have a single source of
  truth and a single place to change *all* data in your application.

- Support for *dynamically* loaded routes on both client and server environments. This is key for
  building modern-day [progressive web apps](https://developers.google.com/web/progressive-web-apps/).

- [Middleware](./packages/mobx-little-router/docs/advanced/middleware.md) layer that provides *extensibility* to the router.

- Server-side rendering support (SSR) and integration with express server.

- View-agnostic routing capabilities. This means adapters other than React can be created by hooking
  into the router state.

## Quick start

If you are using React, then you'll need to install three modules.

```
npm i --save history@4.x.x mobx-little-router mobx-little-router-react

# Or with yarn
yarn add history@4.x.x
yarn add mobx-little-router
yarn add mobx-little-router-react
```

**Note:** `history` is a third-party peer dependency of the Router. It abstracts away history management
between different JavaScript environments. Learn more [here](https://github.com/ReactTraining/history/).

Then you can create a *Hello World* app as follows.

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { createBrowserHistory } from 'history'
import { install, Outlet, RouterProvider } from 'mobx-little-router-react'

const Home = () => <h1>Hello, World!</h1>

const router = install({
  history: createBrowserHistory(),
  routes: [
   { path: '', component: Home }
  ]
})

router.start(() => {
  // The <Outlet/> element outputs the matched route.
  ReactDOM.render(
    <RouterProvider router={router}>
      <Outlet />
    </RouterProvider>,
    document.getElementById('root')
  )
})
```

For a more comprehensive React example, you can explore the [client](https://github.com/mobx-little-router/mobx-little-router/blob/master/examples/react-client/src/index.js)
and [server](https://github.com/mobx-little-router/mobx-little-router/blob/master/examples/react-server-side-rendering/index.js) examples.

## UMD build

You can play around with the UMD version of the router by including three scripts:

- https://unpkg.com/history@4.x.x/umd/history.js
- https://unpkg.com/mobx@3.x.x/lib/mobx.umd.js
- https://unpkg.com/mobx-little-router@latest/umd/mobx-little-router.js

e.g.

HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
  <script src="https://unpkg.com/history@4.x.x/umd/history.js"></script>
  <script src="https://unpkg.com/mobx@3.x.x/lib/mobx.umd.js"></script>
  <script src="https://unpkg.com/mobx-little-router@canary/umd/mobx-little-router.js"></script>
</head>
<body>
</body>
</html>
```

JS:

```js
let h = History.createMemoryHistory({
  initialEntries: ['/a']
})

let router = mobxLittleRouter.install({
  history: h,
  getContext: function() { return {} },
  routes: [
    { path: 'a' },
    { path: 'b' },
    { path: 'c' }
  ]
})

mobx.autorun(() => {
  console.log(`pathname is ${router.location.pathname}`)
})

router.start(() =>
  router.push('/b').then(() =>
    router.push('/c')
  )
)
```

Output:

```
"pathname is undefined"
"pathname is /a/"
"pathname is /b/"
"pathname is /c/"
```

Live example: [http://jsbin.com/hahehodajo/edit?html,js,console](http://jsbin.com/hahehodajo/edit?html,js,console)

## Running examples

Install modules by running `yarn`, then run `yarn start` and follow the prompts.

## Learn more

For more information, you may refer to the README files for each of the packages under MobX Little Router.

- [`mobx-little-router`](./packages/mobx-little-router)
- [`mobx-little-router-react`](./packages/mobx-little-router-react)

## CHANGELOG

See: [CHANGELOG.md](./CHANGELOG.md)

## Development

This project is a [monorepo](http://www.drmaciver.com/2016/10/why-you-should-use-a-single-repository-for-all-your-companys-projects/)
that contains several smaller packages.

To manage the different packages, [lerna](https://lernajs.io/)
and yarn [workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/) are used.

Make sure you have `yarn >= 1.0.0` in order to use workspaces.

```
npm install -g yarn@">=1.0.0"
```

### Installation

Run git clone and install.

```
git clone git@github.com:mobx-router/mobx-router.git mobx-router
cd mobx-router
yarn bootstrap
```

### Running tests

To run tests, run `yarn test` from either the root or a package directory.

If you want to get the coverage report locally, you can run `yarn test --coverage` which will
generate report files under the `coverage/` folder.

### Building

To build packages, run `yarn build` from either the root, or a package directory.

### Publishing

Make sure you have publishing rights for all the packages before continuing.

To publish to latest tag:

```
yarn publish:latest
```

To publish a canary tag:

```
yarn publish:canary
```

Lerna will prompt you for the next version as well as show you which packages/examples will be updated.
All inter-package dependencies will be updated by Lerna so you should *never* update package.json versions by hand.
