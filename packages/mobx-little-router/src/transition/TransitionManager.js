// @flow
import type { TransitionType, Transitionable } from './types'

export default  {
  async run(type: TransitionType, items: Transitionable[]) {
    for (const item of items) {
      const { value: { onTransition } } = item
      if (typeof onTransition === 'function') {
        await onTransition({
          type,
          node: item
        })
      }
    }
  }
}
