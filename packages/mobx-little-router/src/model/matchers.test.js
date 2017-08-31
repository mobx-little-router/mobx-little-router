// @flow
import * as m from './matchers'

describe('Route matchers', () => {
  test('partial', () => {
    const x = m.partial('shows/:id')
    const result = x('/shows/1/edit')
    expect(result.segment).toEqual('/shows/1')
    expect(result.remaining).toEqual('/edit')
  })

  test('full', () => {
    const x = m.full('shows/:id')
    const result = x('/shows/1')
    expect(result.segment).toEqual('/shows/1')
    expect(result.remaining).toEqual(undefined)
  })
})
