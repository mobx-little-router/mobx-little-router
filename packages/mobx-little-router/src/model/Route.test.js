// @flow
import Route from './Route'
import Navigation from './Navigation'

describe('Route', () => {
  test('Handles nesting and compound paths', () => {
    const config = {
      path: '',
      children: [
        {
          path: 'a/b/c',
          willActivate: async () => {},
          willDeactivate: async () => {},
          canActivate: async () => {},
          canDeactivate: async () => {},
          data: { msg: 'hello' },
          children: [
            {
              path: 'd'
            }
          ]
        },
        {
          path: 'e'
        },
        {
          path: 'f'
        }
      ]
    }

    const root = Route(config)

    expect(root.value.path).toEqual('')
    expect(root.children.map(x => x.value.path)).toEqual(['a/b/c', 'e', 'f'])
    expect(root.children[0].children.map(x => x.value.path)).toEqual(['d'])
    expect(root.children[0].value.data.msg).toEqual('hello')
    expect(root.children[0].value.willActivate).toBeInstanceOf(Function)
    expect(root.children[0].value.willDeactivate).toBeInstanceOf(Function)
    expect(root.children[0].value.canActivate).toBeInstanceOf(Function)
    expect(root.children[0].value.canDeactivate).toBeInstanceOf(Function)
  })

  test('Sets correct dynamic children loader', async () => {
    const config = {
      path: '',
      loadChildren: () =>
        Promise.resolve([
          {
            path: 'a'
          },
          {
            path: 'b'
          },
          {
            path: 'c'
          }
        ])
    }

    const root = Route(config)
    const nodes = root.value.loadChildren ? await root.value.loadChildren() : []
    expect(nodes.map(n => n.value.path)).toEqual(['a', 'b', 'c'])
  })

  test('Validation', () => {
    let x: any = {}
    expect(() => Route(x)).toThrow(/`path`/)

    x = { path: '', willActivate: 1 }
    expect(() => Route(x)).toThrow(/`willActivate`/)
  })

  test('Context chain', () => {
    const config = {
      path: '',
      children: [
        {
          path: 'a'
        },
        {
          path: 'b'
        },
        {
          path: 'c'
        }
      ]
    }

    const root = Route(config, () => ({ message: 'Hello' }))

    expect(root.value.getContext()).toEqual({ message: 'Hello' })

    root.children.forEach(c => {
      expect(c.value.getContext()).toEqual({ message: 'Hello' })
    })
  })

  test('Handles redirect config', (done) => {
    const node = Route(
      {
        path: 'a',
        redirectTo: '/b'
      },
      () => ({ message: 'Hello' })
    )

    expect(node.value.path).toEqual('a')

    const { willActivate } = node.value
    const navigation = new Navigation({
      type: 'PUSH',
      sequence: 0
    })

    willActivate(node, navigation, {}).catch(err => {
      expect(err).toBeInstanceOf(Navigation)
      expect(err.to.pathname).toEqual('/b')
      done()
    })
  })
})
