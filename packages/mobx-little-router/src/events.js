// @flow
import type { RouteNode, Location } from './routing/types'

/*
  * Sequence of events that occur from navigation start to end.
 */

export const EventTypes = {
  NAVIGATION_START: 'NAVIGATION_START',
  GUARD_CHECKS_START: 'GUARD_CHECKS_START',
  GUARD_CHECKS_END: 'GUARD_CHECKS_END',
  GUARD_CHECKS_FAIL: 'GUARD_CHECKS_FAIL',
  CHILDREN_LOAD_START: 'CHILDREN_LOAD_START',
  CHILDREN_LOAD_END: 'CHILDREN_LOAD_END',
  ACTIVATION_END: 'ACTIVATION_END',
  TRANSITION_START: 'TRANSITION_START',
  TRANSITION_END: 'TRANSITION_END',
  NAVIGATION_ERROR: 'NAVIGATION_ERROR',
  NAVIGATION_END: 'NAVIGATION_END'
}

export type Event =
  | NavigationStart
  | GuardChecksStart
  | GuardChecksEnd
  | GuardChecksFail
  | GuardChecksEnd
  | ActivationStart
  | ChildrenLoadStart
  | ChildrenLoadError
  | ChildrenLoadEnd
  | ActivationEnd
  | TransitionStart
  | TransitionEnd
  | NavigationError
  | NavigationEnd

export type NavigationStart = {
  type: 'NAVIGATION_START',
  location: Location
}

export const GUARD_CHECKS_START = 'GUARD_CHECKS_START'
export type GuardChecksStart = {
  type: 'GUARD_CHECKS_START',
  location: Location
}

export type GuardChecksEnd = {
  type: 'GUARD_CHECKS_END',
  location: Location
}

export type GuardChecksFail = {
  type: 'GUARD_CHECKS_FAIL',
  location: Location
}

export type ActivationStart = {
  type: 'ACTIVATION_START',
  from: null | Location,
  to: Location
}

export type ChildrenLoadStart = {
  type: 'CHILDREN_LOAD_START',
  loaded: any
}

export type ChildrenLoadEnd = {
  type: 'CHILDREN_LOAD_END',
  loaded: any
}

export type ChildrenLoadError = {
  type: 'CHILDREN_LOAD_ERROR',
  loaded: any,
  error: any
}

export type ActivationEnd = {
  type: 'ACTIVATION_END',
  location: Location
}

export type TransitionStart = {
  type: 'TRANSITION_START',
  location: Location,
  from: RouteNode,
  to: RouteNode
}

export type TransitionEnd = {
  type: 'TRANSITION_END',
  location: Location,
  from: RouteNode,
  to: RouteNode
}

export type NavigationEnd = {
  type: 'NAVIGATION_END',
  location: Location
}

export type NavigationError = {
  type: 'NAVIGATION_ERROR',
  location: Location,
  error: any
}
