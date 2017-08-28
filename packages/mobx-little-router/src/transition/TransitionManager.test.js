// @flow
import { TreeNode } from '../util/tree'
import TransitionManager from './TransitionManager'

describe('TransitionManager', () => {
  let mgr

  beforeEach(() => {
    mgr = new TransitionManager()
  })

  test('Transition is cancellable from event', async () => {
    const spyA = jest.fn((evt: *) => evt.cancel())
    const spyB = jest.fn(() => Promise.resolve())
    const spyC = jest.fn(() => Promise.resolve())

    const nodes = [createNode('a', spyA), createNode('b', spyB), createNode('c', spyC)]
    const transition = mgr.run('entering', nodes)

    await transition

    expect(spyB).not.toHaveBeenCalled()
    expect(spyC).not.toHaveBeenCalled()
  })
})

function createNode(id: string, callback: *) {
  return TreeNode(
    {
      id,
      onTransition: callback || jest.fn(() => onTick())
    },
    []
  )
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
