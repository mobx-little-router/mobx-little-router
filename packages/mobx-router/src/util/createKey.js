// @flow

export default function createKey(keyLength: number) {
  return Math.random().toString(36).substr(2, keyLength)
}
