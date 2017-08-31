// @flow
import TransitionManager from './TransitionManager'
import delay from '../util/delay'

describe('TransitionManager', () => {
  test('Transition is called and resolved in order', async () => {
    const spy = jest.fn((evt: *) => delay(Math.random() * 20))
    const nodes = [createNode('a', spy), createNode('b', spy), createNode('c', spy)]

    await TransitionManager.run('activating', nodes)

    expect(spy).toHaveBeenCalledTimes(3)
    expect(spy.mock.calls.map(x => x[0])).toEqual([
      { type: 'activating', target: nodes[0] },
      { type: 'activating', target: nodes[1] },
      { type: 'activating', target: nodes[2] }
    ])

    spy.mockReset()

    await TransitionManager.run('deactivating', nodes)

    expect(spy).toHaveBeenCalledTimes(3)
    expect(spy.mock.calls.map(x => x[0])).toEqual([
      { type: 'deactivating', target: nodes[0] },
      { type: 'deactivating', target: nodes[1] },
      { type: 'deactivating', target: nodes[2] }
    ])
  })
})

function createNode(id: string, callback: *) {
  return {
    id,
      onTransition: callback || jest.fn(() => onTick())
    }
}

const resolves = []

function onTick() {
  return new Promise(res => {
    resolves.unshift(res)
  })
}

async function tick() {
  const res = resolves.pop()
  if (res) {
    res()
  }
}
