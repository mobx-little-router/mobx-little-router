// @flow
import assertPathMatched from './assertPathMatched'
import createRouteNode from '../routing/createRouteNode'

describe('assertPathMatched', () => {
  let routes

  beforeEach(() => {
    routes = [
      createRouteNode({
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

  test('Unhandled no match error', async () => {
    const results = [
      {
        node: routes[0],
        segment: 'a',
        params: {}
      }
    ]
    await expect(mapErrorString(assertPathMatched(['a', 'nope'], results))).rejects.toMatch(/No match/)
  })

  test('Handled no match error', async () => {
    routes[0].value.hooks.onError = [() => Promise.resolve()] // Resolves error to allow match.
    let results = [
      { node: routes[0], segment: 'a', params: {} }
    ]

    await expect(assertPathMatched(['a', 'b', 'c', 'nope'], results)).resolves.toBe(undefined)

    // Now set handler on all nodes. Only leaf should call.
    routes[0].value.hooks.onError = [jest.fn(() => Promise.resolve())]
    routes[0].children[0].value.hooks.onError = [jest.fn(() => Promise.resolve())]
    routes[0].children[0].children[0].value.hooks.onError = [jest.fn(() => Promise.resolve())]
    results = [
      { node: routes[0], segment: 'a', params: {} },
      { node: routes[0].children[0], segment: 'b', params: {} },
      { node: routes[0].children[0].children[0], segment: 'c', params: {} }
    ]

    await expect(assertPathMatched(['a', 'b', 'c', 'nope'], results)).resolves.toBe(undefined)
    expect(routes[0].value.hooks.onError[0]).not.toHaveBeenCalled()
    expect(routes[0].children[0].value.hooks.onError[0]).not.toHaveBeenCalled()
    expect(routes[0].children[0].children[0].value.hooks.onError[0]).toHaveBeenCalledTimes(1)
  })

  test('All handlers reject', async () => {
    // Now set handler on all nodes. Only leaf should call.
    routes[0].value.hooks.onError = [jest.fn(() => Promise.reject())]
    routes[0].children[0].value.hooks.onError = [jest.fn(() => Promise.reject())]
    routes[0].children[0].children[0].value.hooks.onError = [jest.fn(() => Promise.reject())]
    const results = [
      { node: routes[0], segment: 'a', params: {} },
      { node: routes[0].children[0], segment: 'b', params: {} },
      { node: routes[0].children[0].children[0], segment: 'c', params: {} }
    ]

    await expect(mapErrorString(assertPathMatched(['a', 'b', 'c', 'nope'], results))).rejects.toMatch(/No match/)
    expect(routes[0].value.hooks.onError[0]).toHaveBeenCalled()
    expect(routes[0].children[0].value.hooks.onError[0]).toHaveBeenCalled()
    expect(routes[0].children[0].children[0].value.hooks.onError[0]).toHaveBeenCalled()
  })

  test('If last unmatched part is empty string, then ignore it', async () => {
    const results = [
      { node: routes[0], segment: 'a', params: {} },
      { node: routes[0].children[0], segment: 'b', params: {} },
      { node: routes[0].children[0].children[0], segment: 'c', params: {} }
    ]

    await expect(mapErrorString(assertPathMatched(['a', 'b', 'c', ''], results))).resolves.toBe(undefined)
  })
})

function mapErrorString(p: Promise<any>): Promise<string> {
  return p.catch(x => {
    throw x.toString()
  })
}
