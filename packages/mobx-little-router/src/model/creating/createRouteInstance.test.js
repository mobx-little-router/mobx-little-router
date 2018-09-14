// @flow
import { autorun, runInAction } from 'mobx'
import createRouteStateTreeNode from './createRouteStateTreeNode'
import createRouteInstance from './createRouteInstance'

describe('createRouteStateTreeNode', () => {
  test('Sets the params, context and data', () => {
    expect(
      createRouteInstance(
        createRouteStateTreeNode(
          {
            path: '/a/:a/b/:b',
            children: [],
            getData: () => ({ message: 'Hello' })
          },
          () => ({
            user: 'Alice'
          })
        ),
        '/root',
        '/a/1/b/2',
        { a: '1', b: '2' },
        { q: 'hey' }
      )
    ).toEqual(
      expect.objectContaining({
        parentUrl: '/root',
        segment: '/a/1/b/2',
        value: `/root/a/1/b/2?q=hey`,
        params: { a: '1', b: '2' },
        query: { q: 'hey' },
        data: expect.objectContaining({ message: 'Hello' }),
        context: { user: 'Alice' }
      })
    )
  })

  test('Creates model that change over time', () => {
    const results = []
    const route = createRouteInstance(
      createRouteStateTreeNode({
        path: '/a/:a',
        children: [],
        model: {
          firstName: 'Alice',
          lastName: 'Alison',
          get fullName() {
            return this.firstName + ' ' + this.lastName
          }
        }
      }),
      '/root',
      '/a/1',
      { a: '1' },
      {}
    )

    autorun(() => {
      results.push(route.model.fullName)
    })

    runInAction(() => {
      route.model.firstName = 'Bob'
      route.model.lastName = 'McBob'
    })

    expect(results).toEqual(['Alice Alison', 'Bob McBob'])
  })

  test('Creates subscriptions and dispose function', () => {
    const results = []
    const route = createRouteInstance(
      createRouteStateTreeNode({
        path: '/',
        children: [],
        model: {
          user: null
        },
        subscriptions: route => {
          return autorun(() => {
            const { model } = route
            if (model.user) results.push(model.user.name)
          })
        }
      }),
      '/',
      '',
      {},
      {}
    )

    route.activate()

    runInAction(() => {
      route.model.user = { name: 'Alice' }
    })

    runInAction(() => {
      route.model.user = { name: 'Bob' }
    })

    route.dispose()

    runInAction(() => {
      route.model = { name: 'Fred' }
    })

    expect(results).toEqual(['Alice', 'Bob'])
  })
})
