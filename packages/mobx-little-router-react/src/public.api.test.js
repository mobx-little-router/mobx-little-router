// @flow
import * as React from 'react'
import { RouterProvider, Link, Outlet, withRouter } from './'
import { render } from 'enzyme'

describe('Public API', () => {
  test('Exports', () => {
    expect(RouterProvider).toBeDefined()
    expect(Link).toBeDefined()
    expect(Outlet).toBeDefined()
    expect(withRouter).toBeDefined()
  })

  test('DX: missing context', () => {
    expect(() => render(<Link to="/">Test</Link>)).toThrow(/<RouterProvider router={router}>/)
  })
})
