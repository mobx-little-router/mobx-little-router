// @flow
import type { TransitionType, Transitionable } from './types'

export default {
  run(type: TransitionType, targets: Transitionable[]): Promise<*> {
    return targets.reduce((curr, target) => {
      const { onTransition } = target
      if (typeof onTransition === 'function') {
        return curr.then(() => onTransition({
          type,
          target
        }))
      } else {
        return curr
      }
    }, Promise.resolve())
  }
}
