// @flow
import { autorun } from 'mobx'
import { createMemoryHistory } from 'history'
import { install } from './'

function delay(ms: number) {
  return new Promise(res => {
    setTimeout(() => res(), ms)
  })
}

describe('Routing', () => {
  let m

  beforeEach(() => {
    m = install({
      createHistory: createMemoryHistory,
      routes: [
        {
          path: ':whatever'
        }
      ]
    })
  })

  test('reaction to push navigation', async () => {
    let reactedCount = 0

    autorun(() => {
      const pathname = m.store.location && m.store.location.pathname
      reactedCount++
    })

    m.start()

    m.history.push('/foo')
    m.history.push('/bar')

    await delay(0)

    expect(m.store.location && m.store.location.pathname).toEqual('/bar/')

    m.history.goBack()

    await delay(0)

    expect(m.store.location && m.store.location.pathname).toEqual('/foo/')

    m.history.push('/bar')
    m.history.replace('/quux')

    await delay(0)

    expect(m.store.location && m.store.location.pathname).toEqual('/quux/')

    expect(reactedCount).toEqual(6)

    m.stop()
  })
})
