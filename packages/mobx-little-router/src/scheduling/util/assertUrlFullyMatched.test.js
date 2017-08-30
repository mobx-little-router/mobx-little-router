// @flow
import assertUrlFullyMatched from './assertUrlFullyMatched'
import Route from '../../model/Route'

describe('assertUrlFullyMatched', () => {
  let routes

  beforeEach(() => {
    routes = [
      Route({
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
        remaining: '/nope',
        params: {}
      }
    ]
    await expect(
      mapErrorString(assertUrlFullyMatched('/a/nope', results))
    ).rejects.toMatch(/No match/)
  })

  test('Handled no match error', async () => {
    routes[0].value.onError = () => Promise.resolve() // Resolves error to allow match.
    let results = [{ node: routes[0], remaining: '/b/c', params: {} }]

    await expect(assertUrlFullyMatched('/a/b/c', results)).resolves.toBe(undefined)

    // Now set handler on all nodes. Only leaf should call.
    routes[0].value.onError = jest.fn(() => Promise.resolve())
    routes[0].children[0].value.onError = jest.fn(() => Promise.resolve())
    routes[0].children[0].children[0].value.onError = jest.fn(() => Promise.resolve())
    results = [
      { node: routes[0], remaining: '/b/c/nope', params: {} },
      { node: routes[0].children[0], remaining: '/c/nope', params: {} },
      { node: routes[0].children[0].children[0], remaining: '/nope', params: {} }
    ]

    await expect(assertUrlFullyMatched('/a/b/c/nope', results)).resolves.toBe(undefined)
    expect(routes[0].value.onError).not.toHaveBeenCalled()
    expect(routes[0].children[0].value.onError).not.toHaveBeenCalled()
    expect(routes[0].children[0].children[0].value.onError).toHaveBeenCalledTimes(1)
  })

  test('All handlers reject', async () => {
    // Now set handler on all nodes. Only leaf should call.
    routes[0].value.onError = jest.fn(() => Promise.reject())
    routes[0].children[0].value.onError = jest.fn(() => Promise.reject())
    routes[0].children[0].children[0].value.onError = jest.fn(() => Promise.reject())
    const results = [
      { node: routes[0], remaining: '/b/c/nope', params: {} },
      { node: routes[0].children[0], remaining: '/c/nope', params: {} },
      { node: routes[0].children[0].children[0], remaining: '/nope', params: {} }
    ]

    await expect(
      mapErrorString(assertUrlFullyMatched('/a/b/c/nope', results))
    ).rejects.toMatch(/No match/)
    expect(routes[0].value.onError).toHaveBeenCalled()
    expect(routes[0].children[0].value.onError).toHaveBeenCalled()
    expect(routes[0].children[0].children[0].value.onError).toHaveBeenCalled()
  })

  test('If last unmatched URL is /, then ignore it', async () => {
    const results = [
      { node: routes[0], remaining: '/b/c/', params: {} },
      { node: routes[0].children[0], remaining: '/c/', params: {} },
      { node: routes[0].children[0].children[0], remaining: '/', params: {} }
    ]

    await expect(mapErrorString(assertUrlFullyMatched('/a/b/c/', results))).resolves.toBe(
      undefined
    )
  })
})

function mapErrorString(p: Promise<any>): Promise<string> {
  return p.catch(x => {
    throw x.toString()
  })
}
