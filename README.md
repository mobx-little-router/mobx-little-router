# MobX Router

A view-agnostic router that uses [MobX](https://mobx.js.org/) to manage its internal state.
This differs from other router libraries that are component-based.

## TODO

Write up more docs...

## Development

This project is a [monorepo](http://www.drmaciver.com/2016/10/why-you-should-use-a-single-repository-for-all-your-companys-projects/)
that contains several smaller packages.

To manage the different packages, [lerna](https://lernajs.io/)
and yarn [workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/) are used.

Make sure you have `yarn >= 0.28.0`.

### Installation

```
npm install -g yarn@latest
```

Then git clone and install.

```
git clone git@github.com:mobx-router/mobx-router.git mobx-router
cd mobx-router
yarn install
```

### Running tests

Tests can be run in the individual packages, or from the project root by using the command `yarn test`.
