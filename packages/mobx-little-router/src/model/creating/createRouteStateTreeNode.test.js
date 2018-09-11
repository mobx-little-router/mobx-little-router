// @flow
import createRouteStateTreeNode from './createRouteStateTreeNode'
import createRouteInstance from './createRouteInstance'
import Navigation from '../Navigation'

describe('createRouteStateTreeNode', () => {
  test('Handles nesting and compound paths', () => {
    const config = {
      path: '',
      match: 'partial',
      children: [
        {
          path: 'a/b/c',
          willActivate: async () => {},
          willDeactivate: async () => {},
          canActivate: async () => {},
          canDeactivate: async () => {},
          willResolve: async () => {},
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

    const root = createRouteStateTreeNode(config)

    expect(root.value.path).toEqual('')
    expect(root.children.map(x => x.value.path)).toEqual(['a/b/c', 'e', 'f'])
    expect(root.children[0].children.map(x => x.value.path)).toEqual(['d'])
    expect(root.children[0].value.willActivate).toBeInstanceOf(Function)
    expect(root.children[0].value.willDeactivate).toBeInstanceOf(Function)
    expect(root.children[0].value.canActivate).toBeInstanceOf(Function)
    expect(root.children[0].value.canDeactivate).toBeInstanceOf(Function)
  })

  test('Validation', () => {
    let x: any = {}
    expect(() => createRouteStateTreeNode(x)).toThrow(/`path`/)

    x = { path: '', willActivate: 1 }
    expect(() => createRouteStateTreeNode(x)).toThrow(/`willActivate`/)
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

    const root = createRouteStateTreeNode(config, () => ({ message: 'Hello' }))

    expect(root.value.getContext()).toEqual({ message: 'Hello' })

    root.children.forEach(c => {
      expect(c.value.getContext()).toEqual({ message: 'Hello' })
    })
  })
})
