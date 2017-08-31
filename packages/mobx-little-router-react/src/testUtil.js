// @flow
import React from 'react'
import { render, shallow, mount } from 'enzyme'
import { install, Router } from 'mobx-little-router'
import RouterProvider from './components/RouterProvider'
import { createMemoryHistory } from 'history'

export function createRouteStateTreeNoder(routes: Array<*>, initialEntry: ?string = '/') {
  return typeof initialEntry === 'string' ? install({
    createHistory: [
      createMemoryHistory,
      { initialEntries: [initialEntry] }
    ],
    getContext: () => ({}),
    routes
  }) : install({
    createHistory: createMemoryHistory,
    getContext: () => ({}),
    routes
  })
}

export const callInProvider = (f: Function) => (x: Router | Array<*>) => (
  y: React.Element<*>
) => {
  const router = x instanceof Router ? x : createRouteStateTreeNoder(x)
  return f(<RouterProvider router={router}>{y}</RouterProvider>)
}

export const renderInProvider = callInProvider(render)
export const mountInProvider = callInProvider(mount)
