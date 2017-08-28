// @flow
import type { Location } from '../model/types'
import Navigation from './Navigation'

/*
  * Sequence of events that occur from navigation start to end.
 */

export const EventTypes = {
  NAVIGATION_START: 'NAVIGATION_START',
  NAVIGATION_ABORTED: 'NAVIGATION_ABORTED',
  NAVIGATION_ERROR: 'NAVIGATION_ERROR',
  NAVIGATION_END: 'NAVIGATION_END'
}

export type Event =
  | NavigationStart
  | NavigationError
  | NavigationAborted
  | NavigationEnd

export type NavigationStart = {
  type: 'NAVIGATION_START',
  location: Location
}

export type NavigationEnd = {
  type: 'NAVIGATION_END',
  location: Location
}

export type NavigationAborted = {
  type: 'NAVIGATION_ABORTED',
  location: Location,
  nextNavigation: Navigation
}

export type NavigationError = {
  type: 'NAVIGATION_ERROR',
  location: Location,
  error: any
}
