// @flow
import type { TypeResult } from './types'

export function and(...fs: TypeResult[]) {
  return (x: any) => {
    let _pass = true
    let _type = 'and(...)'

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
      type: `or(${types.join(' ')})`,
      pass: _pass
    }
  }
}
