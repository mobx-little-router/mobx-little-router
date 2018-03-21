// @flow
import type { Router } from 'mobx-little-router'

export function assertRouterExists(router: ?Router) {
  if (router) {
    return
  }
  if (process && process.env.NODE_ENV === 'test') {
    throw new Error(`<Link/> component was rendered without <RouterProvider/>. See: https://github.com/mobx-little-router/mobx-little-router#quick-start

You can fix it by rendering as follows:

\`\`\`
import React from 'react'
import renderer from 'react-test-renderer'
import { install, Link, RouterProvider } from 'mobx-little-router-react'
import { createMemoryHistory } from 'history'
const router = install({
  history: createMemoryHistory(),
  routes: [{ path: '/foo' }]
})
renderer.create(
  <RouterProvider router={router}>
    <Link to="/foo">Go to Foo</Link>
  </RouterProvider>
)
\`\`\`
`)
  } else {
    throw new Error(`<Link/> component was rendered without <RouterProvider/>. See: https://github.com/mobx-little-router/mobx-little-router#quick-start`)
  }
}
