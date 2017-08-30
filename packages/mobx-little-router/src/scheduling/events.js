// @flow
import Navigation from '../model/Navigation'

/*
  * Sequence of events that occur from navigation start to end.
 */

export const EventTypes = {
  NAVIGATION_START: 'NAVIGATION_START',
  NAVIGATION_CANCELLED: 'NAVIGATION_CANCELLED',
  NAVIGATION_ACTIVATING: 'NAVIGATION_ACTIVATING',
  NAVIGATION_ERROR: 'NAVIGATION_ERROR',
  NAVIGATION_END: 'NAVIGATION_END'
}

export type Event =
  | NavigationStart
  | NavigationActivating
  | NavigationError
  | NavigationCancelled
  | NavigationEnd

export type NavigationStart = {
  type: 'NAVIGATION_START',
  navigation: Navigation
}

export type NavigationActivating = {
  type: 'NAVIGATION_ACTIVATING',
  navigation: Navigation
}

export type NavigationEnd = {
  type: 'NAVIGATION_END',
  navigation: Navigation
}

export type NavigationCancelled = {
  type: 'NAVIGATION_CANCELLED',
  nextNavigation: Navigation
}

export type NavigationError = {
  type: 'NAVIGATION_ERROR',
  navigation: Navigation,
  error: any
}
