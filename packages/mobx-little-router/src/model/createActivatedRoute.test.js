// @flow
import createRoute from './createRoute'
import createActivatedRoute from './createActivatedRoute'

describe('createActivatedRoute', () => {
  let node

  beforeEach(() => {
    node = createRoute(
      {
        path: '',
        children: [],
        getData: () => ({ message: 'Hello' })
      },
      () => ({
        user: 'Alice'
      })
    )
  })

  test('Sets the params, context and data', () => {
    expect(createActivatedRoute(node, { id: '1' })).toEqual(
      expect.objectContaining({
        params: { id: '1' },
        data: { message: 'Hello' },
        context: { user: 'Alice' }
      })
    )
  })
})
