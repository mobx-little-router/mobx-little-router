// @flow
import createRouteNode from './createRouteNode'

describe('createRouteNode', () => {
  test('Handles nesting and compound paths', () => {
    const config = {
      path: '',
      children: [
        {
          path: 'a/b/c',
          onEnter: () => {},
          onLeave: () => {},
          canActivate: async () => {},
          canDeactivate: async () => {},
          data: { msg: 'hello' },
          children: [{ path: 'd' }]
        },
        { path: 'e' },
        { path: 'f' }
      ]
    }

    const root = createRouteNode(config)

    expect(root.value.path).toEqual('')
    expect(root.children.map(x => x.value.path)).toEqual(['a/b/c', 'e', 'f'])
    expect(root.children[0].children.map(x => x.value.path)).toEqual(['d'])
    expect(root.children[0].value.data.msg).toEqual('hello')
    expect(root.children[0].value.onEnter).toBeInstanceOf(Function)
    expect(root.children[0].value.onLeave).toBeInstanceOf(Function)
    expect(root.children[0].value.canActivate).toBeInstanceOf(Function)
    expect(root.children[0].value.canDeactivate).toBeInstanceOf(Function)
  })

  test('Sets correct dynamic children loader', async () => {
    const config = {
      path: '',
      loadChildren: () => Promise.resolve([
        { path: 'a' },
        { path: 'b' },
        { path: 'c' }
      ])
    }

    const root = createRouteNode(config)
    const nodes = root.value.loadChildren ? await root.value.loadChildren() : []
    expect(nodes.map(n => n.value.path)).toEqual(['a', 'b', 'c'])
  })
})
