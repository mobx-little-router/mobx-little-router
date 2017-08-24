// @flow
export type Transitionable = $Shape<{
  value:{
    onTransition: null | TransitionFn,
    [string]: any
  },
  [string]: any
}>

export type TransitionFn  = (evt: TransitionEvent) => Promise<void>

export const TransitionTypes = {
  'entering': 'entering',
  'leaving': 'leaving'
}

export type TransitionType = $Keys<typeof TransitionTypes>

export type TransitionEvent = {
  type: TransitionType,
  node: Transitionable,
  // This cancel method is meant to cancel all currently queued transitions.
  // We may want to ensure that in-flight transitions are also cancelled, and
  // provide as `onTransitionCancelled` callback
  cancel: () => void
}
