// @flow
import * as m from './matchers'

describe('URL matchers', () => {
  test('partial', () => {
    expect(m.partial('shows/:id').match('/shows/1/edit')).toEqual({
      matched: true,
      params: { id: '1' },
      parentUrl: '',
      segment: '/shows/1',
      remaining: '/edit'
    })

    expect(m.partial('/shows/:id').match('/shows/2/edit')).toEqual({
      matched: true,
      params: { id: '2' },
      parentUrl: '',
      segment: '/shows/2',
      remaining: '/edit'
    })

    expect(m.partial('').match('/shows/2')).toEqual({
      matched: true,
      params: {},
      parentUrl: '',
      segment: '',
      remaining: '/shows/2'
    })

    expect(m.partial('/').match('/shows/2')).toEqual({
      matched: true,
      params: {},
      parentUrl: '',
      segment: '',
      remaining: '/shows/2'
    })

    expect(m.partial('/shows/:id').match('/nope')).toEqual({
      matched: false,
      params: null,
      parentUrl: '',
      segment: '',
      remaining: '/nope'
    })
  })

  test('full', () => {
    expect(m.full('shows/:id').match('/shows/1')).toEqual({
      matched: true,
      params: { id: '1' },
      parentUrl: '',
      segment: '/shows/1',
      remaining: undefined
    })

    expect(m.full('/shows/:id').match('/shows/2')).toEqual({
      matched: true,
      params: { id: '2' },
      parentUrl: '',
      segment: '/shows/2',
      remaining: undefined
    })

    expect(m.full('/').match('/')).toEqual({
      matched: true,
      params: {},
      parentUrl: '',
      segment: '',
      remaining: undefined
    })

    expect(m.full('').match('/')).toEqual({
      matched: true,
      params: {},
      parentUrl: '',
      segment: '',
      remaining: undefined
    })

    expect(m.full('').match('/shows/1')).toEqual({
      matched: false,
      params: null,
      parentUrl: '',
      segment: '',
      remaining: '/shows/1'
    })
  })

  test('any', () => {
    expect(m.any('').match('/whatever')).toEqual({
      matched: true,
      params: null,
      parentUrl: '',
      segment: '/whatever',
      remaining: ''
    })
  })

  test('params keys are always returned', () => {
    const x = m.full('(:foo)')
    expect(x.match('/whatever')).toEqual(expect.objectContaining({
      params: { foo: 'whatever' }
    }))

    expect(x.match('/')).toEqual(expect.objectContaining({
      params: { foo: null }
    }))
  })

  test('stringify', () => {
    const x = m.full('(:foo)')
    const y = m.partial('(:foo)')
    const z = m.any('whatever')
    expect(x.stringify({ foo: '1' })).toEqual('/1')
    expect(y.stringify({ foo: '2' })).toEqual('/2')
    expect(() => z.stringify({})).toThrow(/Cannot/)
  })
})
