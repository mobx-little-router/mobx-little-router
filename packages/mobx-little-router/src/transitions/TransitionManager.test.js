// @flow
import { createTreeNode } from '../util/tree'
import TransitionManager from './TransitionManager'

describe('TransitionManager', () => {
  let mgr

  beforeEach(() => {
    mgr = new TransitionManager()
  })

  test('Each transition flags current node as `isTransitioning`', async () => {
    const nodes = [createNode('a'), createNode('b'), createNode('c')]
    const transition = mgr.run('entering', nodes)

    expect(nodes[0].value.isTransitioning).toBe(true)
    expect(nodes[1].value.isTransitioning).toBe(false)
    expect(nodes[2].value.isTransitioning).toBe(false)

    await tick()

    expect(nodes[0].value.isTransitioning).toBe(false)
    expect(nodes[1].value.isTransitioning).toBe(true)
    expect(nodes[2].value.isTransitioning).toBe(false)

    await tick()

    expect(nodes[0].value.isTransitioning).toBe(false)
    expect(nodes[1].value.isTransitioning).toBe(false)
    expect(nodes[2].value.isTransitioning).toBe(true)

    await tick()
    await transition

    expect(nodes[0].value.isTransitioning).toBe(false)
    expect(nodes[1].value.isTransitioning).toBe(false)
    expect(nodes[2].value.isTransitioning).toBe(false)
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
  return createTreeNode(
    {
      id,
      isTransitioning: false,
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
