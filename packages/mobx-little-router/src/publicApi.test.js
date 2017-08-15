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
  let router

  beforeEach(() => {
    router = install({
      createHistory: [
        createMemoryHistory,
        {
          initialEntries: ['/'],
          initialIndex: 0
        }
      ],
      routes: [
        {
          path: ':whatever'
        }
      ]
    })
  })

  test('reaction to push navigation', async () => {
    const changes = []

    autorun(() => {
      changes.push(router.store.location.pathname)
    })

    router.start()

    router.push('/foo')
    await router.push('/bar')

    expect(router.store.location && router.store.location.pathname).toEqual('/bar/')

    await router.goBack()

    expect(router.store.location && router.store.location.pathname).toEqual('/foo/')

    router.push('/bar')
    await router.replace('/quux')

    expect(router.store.location && router.store.location.pathname).toEqual('/quux/')

    expect(changes).toEqual(['/', '/foo/', '/bar/', '/foo/', '/bar/', '/quux/'])

    router.stop()
  })

  test('multiple navigation', async () => {
    const changes = []

    autorun(() => {
      changes.push(router.store.location.pathname)
    })

    router.start()

    router.push('/1')
    router.push('/2')
    router.push('/3')
    router.push('/4')
    router.push('/5')
    router.push('/6')
    router.push('/7')
    router.push('/8')
    router.push('/9')
    await router.push('/10')

    expect(changes).toEqual(['/', '/1/', '/2/', '/3/', '/4/', '/5/', '/6/', '/7/', '/8/', '/9/', '/10/'])

    router.stop()
  })
})
