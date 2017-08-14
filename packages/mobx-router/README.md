# mobx-router

This package provides the core functionality of the MobX router.

## Usage

TODO: Write this up...

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

2. **Scheduling**

  The `Scheduler` class handles all incoming navigation requests. Each request is processed
  in order, and all lifecycle hooks (`canActivate`, `canDeactivate`, etc.) are executed
  on each route node. If a lifecycle hook is rejected on any one node, then the navigation
  is cancelled altogether.

3. **History management**

  Coordinates history events and transitions, and passes the requests down to the `Scheduler`.
