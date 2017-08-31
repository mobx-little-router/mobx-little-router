// @flow
import type { ActivatedRoute } from '../types'
import shallowEqual from '../../util/shallowEqual'

export default function areRoutesEqual(a?: ActivatedRoute<*, *>, b?: ActivatedRoute<*, *>) {
  return !!(a && b) && a.key === b.key && shallowEqual(a.params, b.params)
}
