// @flow
import createRouteNode from './createRouteNode'

async function nop() {}

describe('createRouteNode', () => {
  test('Handles nesting and compound paths', () => {
    const config = {
      path: '',
      children: [
        {
          path: 'a/b/c',
          onEnter: [nop],
          onLeave: [nop],
          canActivate: [nop],
          canDeactivate: [nop],
          data: { msg: 'hello' },
          children: [{ path: 'd' }]
        },
        { path: 'e' },
        { path: 'f' }
      ]
    }

    const root = createRouteNode(config)

    expect(root.value.path).toEqual('')
    expect(root.children.map(x => x.value.path)).toEqual(['a', 'e', 'f'])
    expect(root.children[0].children.map(x => x.value.path)).toEqual(['b'])
    expect(root.children[0].children[0].children.map(x => x.value.path)).toEqual(['c'])
    expect(
      root.children[0].children[0].children[0].children.map(x => x.value.path)
    ).toEqual(['d'])
    expect(root.children[0].children[0].children[0].value.data.msg).toEqual('hello')
    expect(root.children[0].children[0].children[0].value.hooks.onEnter[0]).toBeInstanceOf(Function)
    expect(root.children[0].children[0].children[0].value.hooks.onLeave[0]).toBeInstanceOf(Function)
    expect(root.children[0].children[0].children[0].value.hooks.canActivate[0]).toBeInstanceOf(Function)
    expect(root.children[0].children[0].children[0].value.hooks.canDeactivate[0]).toBeInstanceOf(Function)
  })
})
