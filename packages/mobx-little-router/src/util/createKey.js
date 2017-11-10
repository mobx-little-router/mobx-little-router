// @flow

// Predictable keys for testing
let nextKey = 1
export default function getNextKey() {
  return `${nextKey++}`
}
