// @flow
import React from 'react'
import { createRouter, mountInProvider } from '../testUtil'
import Outlet from './Outlet'

describe('Outlet', () => {
  let router

  beforeEach(() => {
    router = createRouter(
      [
        {
          path: '',
          data: { component: RootPage },
          children: [
            {
              path: 'about',
              data: { component: AboutPage },
              children: [{ path: 'contact', data: { component: ContactPage } }]
            },
            {
              path: 'posts',
              children: [
                { path: '', data: { component: PostListPage } },
                { path: ':id', data: { component: PostViewPage } }
              ]
            }
          ]
        }
      ],
      '/'
    )
    return router.start()
  })

  afterEach(() => {
    router.stop()
  })

  test('Renders', () => {
    const wrapper = mountInProvider(router)(<Outlet />)
    expect(wrapper.html()).toMatch(/RootPage/)
  })

  test('Supports nested routes', async () => {
    await router.push('/about/contact')
    const wrapper = mountInProvider(router)(<Outlet />)
    expect(wrapper.html()).toMatch(/RootPage/)
    expect(wrapper.html()).toMatch(/AboutPage/)
    expect(wrapper.html()).toMatch(/ContactPage/)
  })
})

const RootPage = () => <div>RootPage<Outlet /></div>
const HomePage = () => <div>HomePage<Outlet /></div>
const AboutPage = () => <div>AboutPage<Outlet /></div>
const ContactPage = () => <div>ContactPage</div>
const PostListPage = () => <div>PostListPage</div>
const PostViewPage = () => <div>PostViewPage</div>
