// @flow
import isUrlFullyMatched from './isUrlFullyMatched'
import createRouteStateTreeNode from '../../model/createRouteStateTreeNode'

describe('isUrlFullyMatched', () => {
  let routes

  beforeEach(() => {
    routes = [
      createRouteStateTreeNode({
        path: 'a',
        children: [
          {
            path: 'b',
            children: [
              {
                path: 'c',
                children: []
              }
            ]
          }
        ]
      })
    ]
  })

  test('matched', () => {
    const results = [
      {
        node: routes[0],
        parentUrl: '',
        segment: '/a',
        remaining: '',
        params: {}
      }
    ]
    expect(isUrlFullyMatched('/a', results)).toBe(true)
  })

  test('not matched', () => {
    let results = [{ node: routes[0], parentUrl: '', segment: '', remaining: '/b/c', params: {} }]
    expect(isUrlFullyMatched('/a/b/c', results)).toBe(false)
  })

  test('ignores last "/"', () => {
    const results = [
      { node: routes[0], parentUrl: '', segment: '', remaining: '/b/c/', params: {} },
      { node: routes[0].children[0], parentUrl: '', segment: '', remaining: '/c/', params: {} },
      { node: routes[0].children[0].children[0], parentUrl: '', segment: '', remaining: '/', params: {} }
    ]

    expect(isUrlFullyMatched('/a/b/c/', results)).toBe(true)
  })
})
