// @flow
import type { TypeResult } from './types'

type Spec = {
  [string]: TypeResult
}

export default function createValidator(spec: Spec) {
  const keys = Object.keys(spec)
  return (x: Object) => {
    for (let i = 0; i< keys.length; i++) {
      const key = keys[i]
      const { pass, type } = spec[key](x[key])
      if (!pass) {
        throw new TypeError(`Expected \`${key}\` to be of type \`${type}\`.`)
      }
    }
  }
}
