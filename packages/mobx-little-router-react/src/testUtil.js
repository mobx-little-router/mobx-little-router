// @flow
import React from 'react'
import type { Element } from 'react'
import { render, mount } from 'enzyme'
import { install, Router } from 'mobx-little-router'
import RouterContext from './contexts/RouterContext'
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

export const callInProvider = (f: Function) => (x: Router | Array<*>) => (
  y: Element<*>
) => {
  const router = x instanceof Router ? x : createRouter(x)
  return f(<RouterContext.Provider value={router}>{y}</RouterContext.Provider>)
}

export const renderInProvider = callInProvider(render)
export const mountInProvider = callInProvider(mount)

export function delay(ms: number): Promise<void> {
  return new Promise(res => {
    setTimeout(res, ms)
  })
}
