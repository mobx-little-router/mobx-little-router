// @flow
export type Transitionable = $Shape<{
  onTransition: null | TransitionFn,
  [string]: any
}>

export type TransitionFn  = (evt: TransitionEvent) => Promise<void>

export const TransitionTypes = {
  'activating': 'activating',
  'deactivating': 'deactivating'
}

export type TransitionType = $Keys<typeof TransitionTypes>

export type TransitionEvent = {
  type: TransitionType,
  target: Transitionable
}
