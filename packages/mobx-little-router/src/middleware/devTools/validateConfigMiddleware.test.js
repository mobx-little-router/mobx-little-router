// @flow
import validateConfigMiddleware from './validateConfigMiddleware'
import { EventTypes } from '../../events/index'
import createRouteStateTreeNode from '../../model/createRouteStateTreeNode'

describe('validateConfigMiddleware', () => {
  test('detects unreachable nodes', () => {
    assertInvalidRoot({
      path: '',
      children: [
        { path: '', match: 'partial' },
        { path: 'unreachable' }
      ]
    })

    assertInvalidRoot({
      path: '',
      children: [
        { path: ':a' },
        { path: ':b' },
        { path: ':c' }
      ]
    })

    assertInvalidRoot({
      path: '',
      children: [
        { path: 'a/b/:c' },
        { path: 'a/b/d' }
      ]
    })

    assertInvalidRoot({
      path: '',
      children: [{
        path: '',
        children: [{
          path: '',
          children: [
            { path: 'a/b/:c' },
            { path: 'a/b/d' }
          ]
        }
        ]
      }
      ]
    })

    assertValidRoot({
      path: '',
      children: [
        { path: '' },
        { path: 'a/b/:c' },
        { path: 'a/:b' },
        { path: 'a' },
        { path: '**' }
      ]
    })
  })
})

function assertInvalidRoot(root: any) {
  root = createRouteStateTreeNode(root)
  const result = validateConfigMiddleware.fold({
    type: EventTypes.CHILDREN_LOADED,
    root,
    leaf: {
      node: root
    }
  })
  expect(result).toEqual(
    expect.objectContaining({
      type: EventTypes.NAVIGATION_ERROR,
      error: expect.any(Error)
    })
  )
}

function assertValidRoot(root: any) {
  root = createRouteStateTreeNode(root)
  expect(
    validateConfigMiddleware.fold({
      type: EventTypes.CHILDREN_LOADED,
      root,
      leaf: {
        node: root
      }
    })
  ).not.toEqual(
    expect.objectContaining({
      type: EventTypes.NAVIGATION_ERROR
    })
  )
}
