# Context

The context object can be installed on the main router as an optional argument.

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