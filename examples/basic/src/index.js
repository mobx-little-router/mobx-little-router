import React from 'react'
import * as mobx from 'mobx'
import ReactDOM from 'react-dom'
import { createHashHistory } from 'history'
import { install } from 'mobx-little-router'
import { RouterProvider } from 'mobx-little-router-react'

import { IndexRoute, ShowsRoute, AboutRoute, ContactRoute, ShowRoute, TagRoute } from './routes'
import App from './App'

const router = install({
  createHistory: createHashHistory,
  routes: [
    { path: '', match: 'full', data: { component: IndexRoute } },
    { 
      path: 'about',
      data: { component: AboutRoute },
      onEnter: [(node) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve()
          }, 500)
        })
      }],
      onLeave: [(node) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve()
          }, 500)
        })
      }]
    },
    {
      path: 'contact',
      data: { component: ContactRoute },
      onEnter: [(node) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve()
          }, 500)
        })
      }],
      onLeave: [(node) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve()
          }, 500)
        })
      }]
    },
    {
      path: 'shows',
      data: { component: ShowsRoute },
      children: [{
        path: ':id',
        data: { component: ShowRoute },
        // canDeactivate: [(node) => {
        //   return new Promise((resolve, reject) => {
        //     if (window.confirm("Are you sure")) {
        //       resolve()
        //     } else {
        //       reject()
        //     }
        //   })
        // }],
        onEnter: [(node) => {
          //node.value.data.transitionState = "entering"
          // return new Promise((resolve, reject) => {
          //   if (window.confirm("Enter: Are you sure")) {
          //     resolve()
          //   } else {
          //     reject()
          //   }
          // })
          // setTimeout(() => {
          //   //node.value.data.transitionState = "enter"
          // }, 20000)
          // return Promise.resolve()

          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve()
            }, 500)
          })
        }],
        onLeave: [(node) => {
          //node.value.data.transitionState = "leaving"
          // return new Promise((resolve, reject) => {
          //   if (window.confirm("Leave: Are you sure")) {
          //     resolve()
          //   } else {
          //     reject()
          //   }
          // })
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve()
            }, 500)
          })
        }]
      }]
    },
    {
      path: 'tags/:tag',
      data: { component: TagRoute }
    }
  ]
})

window.store = router.store
window.mobx = mobx

router.start(() => {
  ReactDOM.render(
    <RouterProvider router={router}>
      <App />
    </RouterProvider>,
    document.getElementById('root')
  )
}).catch(() => router.stop())
