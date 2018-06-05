// @flow

export default function assign(to: *, from: *) {
  to.params = from.params
  to.value = from.value
  to.key = from.key
  to.query = from.query
  to.segment = from.segment
  to.parentUrl = from.parentUrl
  return to
}
