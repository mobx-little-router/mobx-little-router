// @flow
import { runInAction } from 'mobx'
import type { TransitionType, Transitionable } from './types'

export default class TransitionManager {
  cancelled = false

  async run(type: TransitionType, items: Transitionable[]) {
    this.cancelled = false

    let cancel = () => {
      this.cancelled = true
    }

    const cancelled = new Promise(res => {
      cancel = () => {
        this.cancelled = true
        res()
      }
    })

    const transitioned = this.doTransition(type, items, cancel)

    return Promise.race([cancelled, transitioned])
  }

  async doTransition(type: TransitionType, items: Transitionable[], canceller: Function) {
    for (const item of items) {
      // If we've been cancelled, skip the rest of the transitions.
      if (this.cancelled) {
        break
      }

      const { value: { onTransition } } = item
      if (typeof onTransition === 'function') {
        runInAction(() => {
          item.value.isTransitioning = true
        })
        try {
          await onTransition({
            type,
            node: item,
            cancel: () => canceller()
          })
        } finally {
          runInAction(() => {
            item.value.isTransitioning = false
          })
        }
      }
    }
  }
}
