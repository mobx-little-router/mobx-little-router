// @flow
import Navigation from '../model/Navigation'
import type { PathElement, Route } from '../model/types'

/*
  * Sequence of events that occur from navigation start to end.
 */

export const EventTypes = {
  EMPTY: 'EMPTY',
  NAVIGATION_START: 'NAVIGATION_START',
  NAVIGATION_MATCH_RESULT: 'NAVIGATION_MATCH_RESULT',
  CHILDREN_CONFIG_REQUEST: 'CHILDREN_CONFIG_REQUEST',
  CHILDREN_CONFIG_LOAD: 'CHILDREN_CONFIG_LOAD',
  CHILDREN_LOAD: 'CHILDREN_LOAD',
  NAVIGATION_RETRY: 'NAVIGATION_RETRY',
  NAVIGATION_ACTIVATING: 'NAVIGATION_ACTIVATING',
  NAVIGATION_ACTIVATED: 'NAVIGATION_ACTIVATED',
  NAVIGATION_CANCELLED: 'NAVIGATION_CANCELLED',
  NAVIGATION_ERROR: 'NAVIGATION_ERROR',
  NAVIGATION_SUCCESS: 'NAVIGATION_SUCCESS',
  NAVIGATION_END: 'NAVIGATION_END'
}

export type Event =
  | Empty
  | NavigationStart
  | NavigationMatchResult
  | ChildrenConfigRequest
  | ChildrenConfigLoad
  | ChildrenLoad
  | NavigationRetry
  | NavigationActivating
  | NavigationActivated
  | NavigationError
  | NavigationCancelled
  | NavigationEnd

export type Empty = {
  type: 'EMPTY',
  etc?: any
}

export type NavigationStart = {
  type: 'NAVIGATION_START',
  navigation: Navigation,
  etc?: any
}

export type NavigationMatchResult = {
  type: 'NAVIGATION_MATCH_RESULT',
  navigation: Navigation,
  matchedPath: PathElement<*, *>[],
  etc?: any
}

export type ChildrenConfigRequest = {
  type: 'CHILDREN_CONFIG_REQUEST',
  navigation: Navigation,
  partialPath: PathElement<*, *>[],
  leaf: PathElement<*, *>,
  loader: () => Promise<any>,
  etc?: any
}

export type ChildrenConfigLoad = {
  type: 'CHILDREN_CONFIG_LOAD',
  navigation: Navigation,
  partialPath: PathElement<*, *>[],
  leaf: PathElement<*, *>,
  module: any,
  etc?: any
}

export type ChildrenLoad = {
  type: 'CHILDREN_LOAD',
  navigation: null | Navigation,
  partialPath: null | PathElement<*, *>[],
  leaf: PathElement<*, *>,
  children: any,
  etc?: any
}

export type NavigationRetry = {
  type: 'NAVIGATION_RETRY',
  navigation: Navigation,
  partialPath: PathElement<*, *>[],
  leaf: PathElement<*, *>,
  etc?: any
}

export type NavigationActivating = {
  type: 'NAVIGATION_ACTIVATING',
  navigation: Navigation,
  routes: Route<*, *>[],
  etc?: any
}

export type NavigationActivated = {
  type: 'NAVIGATION_ACTIVATED',
  navigation: Navigation,
  routes: Route<*, *>[],
  entering: Route<*, *>[],
  exiting: Route<*, *>[],
  etc?: any
}

export type NavigationCancelled = {
  type: 'NAVIGATION_CANCELLED',
  nextNavigation?: Navigation,
  etc?: any
}

export type NavigationError = {
  type: 'NAVIGATION_ERROR',
  navigation: Navigation,
  error: any,
  etc?: any
}

export type NavigationEnd = {
  type: 'NAVIGATION_END',
  navigation: Navigation,
  etc?: any
}
