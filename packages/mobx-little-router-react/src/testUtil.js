// @flow
import React from 'react'
import { render, shallow, mount } from 'enzyme'
import { install, Router } from 'mobx-little-router'
import RouterProvider from './components/RouterProvider'
import { createMemoryHistory } from 'history'

export function createRouter(routes: Array<*>, initialEntry: ?string = '/') {
  return typeof initialEntry === 'string' ? install({
    createHistory: [
      createMemoryHistory,
      { initialEntries: [initialEntry] }
    ],
    routes
  }) : install({
    createHistory: createMemoryHistory,
    routes
  })
}

export const callInProvider = (f: Function) => (x: Router | Array<*>) => (
  y: React.Element<*>
) => {
  const router = x instanceof Router ? x : createRouter(x)
  return f(<RouterProvider router={router}>{y}</RouterProvider>)
}

export const renderInProvider = callInProvider(render)
export const shallowInProvider = callInProvider(shallow)
export const mountInProvider = callInProvider(mount)
