// @flow
import Route from './Route'

describe('Route', () => {
  test('Handles nesting and compound paths', () => {
    const config = {
      path: '',
      children: [
        {
          path: 'a/b/c',
          onEnter: async () => {},
          onLeave: async () => {},
          canActivate: async () => {},
          canDeactivate: async () => {},
          data: { msg: 'hello' },
          children: [{ path: 'd' }]
        },
        { path: 'e' },
        { path: 'f' }
      ]
    }

    const root = Route(config)

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
      loadChildren: () => Promise.resolve([{ path: 'a' }, { path: 'b' }, { path: 'c' }])
    }

    const root = Route(config)
    const nodes = root.value.loadChildren ? await root.value.loadChildren() : []
    expect(nodes.map(n => n.value.path)).toEqual(['a', 'b', 'c'])
  })

  test('Validation', () => {
    let x: any = {}
    expect(() => Route(x)).toThrow(/`path`/)

    x = { path: '', onEnter: 1 }
    expect(() => Route(x)).toThrow(/`onEnter`/)
  })
})
