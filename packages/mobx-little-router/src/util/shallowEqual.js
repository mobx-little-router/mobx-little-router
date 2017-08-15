// @flow

export default function shallowEqual(objA: Object, objB: Object): boolean {
  if (objA === objB) {
    return true
  }

  const aKeys = Object.keys(objA)
  const bKeys = Object.keys(objB)
  const len = aKeys.length

  if (bKeys.length !== len) {
    return false
  }

  for (let i = 0; i < len; i++) {
    const key = aKeys[i]

    if (objA[key] !== objB[key]) {
      return false
    }
  }

  return true
}
