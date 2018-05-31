// @flow
import * as React from 'react'
import { RouterContext, OutletContext, Link, Outlet, withRouter, withOutlet } from './'
import { render } from 'enzyme'

describe('Public API', () => {
  test('Exports', () => {
    expect(RouterContext).toBeDefined()
    expect(OutletContext).toBeDefined()
    expect(Link).toBeDefined()
    expect(Outlet).toBeDefined()
    expect(withRouter).toBeDefined()
    expect(withOutlet).toBeDefined()
  })

  test('DX: missing context', () => {
    expect(() => render(<Link to="/">Test</Link>)).toThrow(/<RouterProvider router={router}>/)
  })
})
