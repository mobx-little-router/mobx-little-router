import React from 'react'
import { RouterProvider, Link, Outlet } from 'mobx-little-router-react'
import { Provider } from 'mobx-react'

export default ({ router, dataStore }) => {
  return (
    <Provider dataStore={dataStore}>
      <RouterProvider router={router}>
        <div style={{ display: 'flex' }}>
          <ul style={{ minWidth: '100px', maxWidth: '200px' }}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/gif/cat">Cat GIF</Link></li>
            <li><Link to="/gif/dog">Dog GIF</Link></li>
            <li><Link to="/404">404</Link></li>
          </ul>

          <div style={{ flex: 1 }}>
            <Outlet />
          </div>
        </div>
      </RouterProvider>
    </Provider>
  )
}
