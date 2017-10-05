// @flow
import * as path from './path'

describe('path util', () => {
  test('resolve', () => {
    expect(path.resolve('a/b/', '/c')).toEqual('/c')
    expect(path.resolve('a/b/', '..')).toEqual('a/')
    expect(path.resolve('a/b', '..')).toEqual('')
    expect(path.resolve('a/b/c/', '../..')).toEqual('a/')
    expect(path.resolve('a/b/c', 'd')).toEqual('a/b/d/')
    expect(path.resolve('a/b/c/', 'd')).toEqual('a/b/c/d/')
  })
})
