# Context

The context object can be installed on the main router as an optional argument.

This will create a `route.context` object when a matched route invokes its corresponding
guards and lifecycle hooks.

```js
import { install } from 'mobx-little-router'
import { createMemoryHistory } from 'history'
import { action, observable } from 'mobx'

class SessionStore {
  @observable
  current = null
}

// Object that holds our stores with observables.
const stores = {
  sessionStore: new SessionStore()
}

const router = install({
  history: createMemoryHistory(),
  // Add store to route context.
  getContext: () => ({ stores }),
  routes: [
    {
      path: 'edit',

      // Now we can access the context from the route object.
      canActivate: (route, navigation) => {
        const { sessionStore } = route.context.stores
        if (sessionStore.current !== null) {
          return true
        } else {
          return navigation.redirectTo('/login')
        }
      }
    }
  ]
}
```

This is useful for sharing stores or other global objects in the system. For example, we may pass
the same `stores` object to `mobx-react`'s `<Provider>` component.
