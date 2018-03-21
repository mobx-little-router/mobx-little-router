// @flow
import React from 'react'
import type { Element } from 'react'
import { render, mount } from 'enzyme'
import { install, Router } from 'mobx-little-router'
import RouterProvider from './components/RouterProvider'
import { createMemoryHistory } from 'history'

export function createRouter(routes: Array<*>, initialEntry: ?string = '/') {
  return typeof initialEntry === 'string' ? install({
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
    getContext: () => ({}),
    routes
  }) : install({
    history: createMemoryHistory(),
    getContext: () => ({}),
    routes
  })
}

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


export const callInProvider = (f: Function) => (x: Router | Array<*>) => (
  y: Element<*>
) => {
  const router = x instanceof Router ? x : createRouter(x)
  return f(<RouterProvider router={router}>{y}</RouterProvider>)
}

export const renderInProvider = callInProvider(render)
export const mountInProvider = callInProvider(mount)

export function delay(ms: number): Promise<void> {
  return new Promise(res => {
    setTimeout(res, ms)
  })
}
