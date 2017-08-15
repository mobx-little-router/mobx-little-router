// @flow

export default function delay(ms: number) {
  return new Promise(res => {
    setTimeout(() => res(), ms)
  })
}
