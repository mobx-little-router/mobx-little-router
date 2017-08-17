// @flow
import { RouterProvider, Link, Outlet, withRouter } from './'

describe('Public API', () => {
  test('Exports', () => {
    expect(RouterProvider).toBeDefined()
    expect(Link).toBeDefined()
    expect(Outlet).toBeDefined()
    expect(withRouter).toBeDefined()
  })
})
