// @flow
import React from 'react'
import { createRouter, mountInProvider } from '../testUtil'
import Outlet from './Outlet'

describe('Outlet', () => {
  let router

  beforeEach(() => {
    router = createRouter([
      { path: '', data: { component: HomePage } },
      { path: 'about', children: [
        { path: '', data: { component: AboutPage } },
        { path: 'contact', data: { component: ContactPage } }
      ] },
      { path: 'posts', children: [
        { path: '', data: { component: PostListPage } },
        { path: ':id', data: { component: PostViewPage } }
      ] }
    ], '/')
    return router.start()
  })

  afterEach(() => {
    router.stop()
  })

  test('Renders', () => {
    const wrapper = mountInProvider(router)(
      <div>
        <Outlet/>
      </div>
    )

    expect(wrapper.html()).toMatch(/HomePage/)
  })
})

const HomePage = () => <div>HomePage</div>
const AboutPage = () => <div>AboutPage</div>
const ContactPage = () => <div>ContactPage</div>
const PostListPage = () => <div>PostListPage</div>
const PostViewPage = () => <div>PostViewPage</div>

