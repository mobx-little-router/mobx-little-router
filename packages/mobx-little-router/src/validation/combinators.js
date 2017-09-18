// @flow
import type { TypeResult } from './types'

export function and(...fs: TypeResult[]) {
  if (fs.length === 0)
    throw new Error('Combinator `and` expects one or more matchers but found none.')
  return (x: any) => {
    let _pass = true
    let _type = 'unknown'

    for (let i = 0; i < fs.length; i++) {
      const f = fs[i]
      const { pass, type } = f(x)
      if (!pass) {
        _type = type
        _pass = pass
        break
      }
    }

    return {
      type: _type,
      pass: _pass
    }
  }
}

export function or(...fs: TypeResult[]) {
  if (fs.length === 0)
    throw new Error('Combinator `or` expects one or more matchers but found none.')
  return (x: any) => {
    let _pass = false
    let types = []

    for (let i = 0; i < fs.length; i++) {
      const f = fs[i]
      const { pass, type } = f(x)

      types.push(type)

      if (pass) {
        _pass = pass
        break
      }
    }

    return {
      type: `${types.join(' | ')}`,
      pass: _pass
    }
  }
}
