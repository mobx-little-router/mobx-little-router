// @flow
import validateConfigMiddleware, { ConfigurationError } from './validateConfigMiddleware'
import { EventTypes } from '../../events/index'
import createRouteStateTreeNode from '../../model/createRouteStateTreeNode'

describe('validateConfigMiddleware', () => {
  test('handles valid config', () => {
    assertValidRoot({
      path: '',
      children: [{ path: 'a' }, { path: 'b' }, { path: 'c' }]
    })

    assertValidRoot({
      path: '',
      children: [{ path: '' }, { path: ':whatever' }]
    })

    assertValidRoot({
      path: '',
      children: [{ path: '' }, { path: 'foo/:bar' }]
    })

    assertValidRoot({
      path: '',
      children: [{ path: 'foo/:bar' }, { path: 'quux/:bar' }]
    })
  })

  test('handles invalid config', () => {
    assertInvalidRoot({
      path: '',
      children: [{ path: ':duplicate' }, { path: ':duplicate' }]
    })

    assertInvalidRoot({
      path: '',
      children: [
        { path: ':whatever' },
        {
          path: '',
          children: [{ path: ':whatever' }]
        }
      ]
    })
  })

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
        { path: '' },
        { path: 'a/b/:c' },
        { path: 'a/b/d' }
      ]
    })

    assertValidRoot({
      path: '',
      children: [
        { path: '' },
        { path: 'a/b' },
        { path: 'a/b/d' },
        { path: 'a/b/c/d/e/f/g/h/i/j' },
        { path: 'a/b/:c' },
        { path: 'a/b/:c/d/e' },
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
      error: expect.any(ConfigurationError)
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
