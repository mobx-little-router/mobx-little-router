// @flow
import type { TransitionType, Transitionable } from './types'

export default {
  async run(type: TransitionType, targets: Transitionable[]) {
    for (const target of targets) {
      const { onTransition } = target
      if (typeof onTransition === 'function') {
        await onTransition({
          type,
          target
        })
      }
    }
  }
}
