// @flow
import { empty } from './matchers'
import { or } from './combinators'

export function optional(f: *): * {
  return or(empty, f)
}
