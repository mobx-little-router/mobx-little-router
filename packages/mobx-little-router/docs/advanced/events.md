# Events

The router works by scheduling and handling a set of events, as defined
in the [`events`](/packages/mobx-little-router/src/events/index.js) module.

The events, in order of execution are as follows.

```js
type Event =
  | Empty
  | NavigationRetry
  | NavigationStart
  | NavigationResultMatched
  | ChildrenConfigRequested
  | ChildrenConfigLoaded
  | ChildrenLoading
  | ChildrenLoaded
  | NavigationActivating
  | NavigationActivated
  | NavigationTransitionStart
  | NavigationTransitionEnd
  | NavigationError
  | NavigationCancelled
  | NavigationEnd
```

The `Empty` navigation is a special event to denote the router has no events.

A normal data flow starts with `NavigationStart` and ends with `NavigationEnd`.
For example, this is a typical flow for when a navigation starts and ends successfully.

```
    NavigationStart
           ↓
 NavigationResultMatched
           ↓
  NavigationActivating
           ↓
   NavigationActivated
           ↓
NavigationTransitionStart
           ↓
 NavigationTransitionEnd
           ↓
      NavigationEnd
```

And this is an example of a navigation that fails a guard.

```
    NavigationStart
           ↓
 NavigationResultMatched
           ↓
  NavigationActivating
           ↓
   NavigationCancelled
```

You can subscribe to event changes by using the router's `subscribeEvent` method.

```js
import { install } from 'mobx-little-router'
const router = install(...)
router.subscribeEvent(evt => console.log(evt))
```

Each event requires its own payload shape, as defined in the [`events`](/packages/mobx-little-router/src/events/index.js) module.

Events in the pipeline can be manipulated through a [middleware](./middleware.md).
