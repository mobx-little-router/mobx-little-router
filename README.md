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

- State management and change detection that lives completely within MobX, so you have one source of
  truth for all data in your application, and one way for data to change.

- Support for dynamically loaded routes on both client and server environments. This is key for
  building modern-day [progressive web apps](https://developers.google.com/web/progressive-web-apps/).

- View-agnostic routing capabilities. This means adapters other than React can be created by hooking
  into the router state.

- Extensible `data` objects that is provided on each route node. This allows additional data and
  behaviour to be created for future use cases.

- Static type support for Flow.

## Learn more

For more information, you may refer to the README files for each of the packages under MobX Little Router.

- [`mobx-little-router`](./packages/mobx-little-router)
- [`mobx-little-router-react`](./packages/mobx-little-router-react)

## Development

This project is a [monorepo](http://www.drmaciver.com/2016/10/why-you-should-use-a-single-repository-for-all-your-companys-projects/)
that contains several smaller packages.

To manage the different packages, [lerna](https://lernajs.io/)
and yarn [workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/) are used.

Make sure you have `yarn >= 0.28.0` and workspace enabled.

```
npm install -g yarn@">=0.28"
yarn config set workspaces-experimental true
```

### Installation

Run git clone and install.

```
git clone git@github.com:mobx-router/mobx-router.git mobx-router
cd mobx-router
yarn install
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
