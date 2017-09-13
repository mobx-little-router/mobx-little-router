// @flow
import Navigation from '../model/Navigation'
import type { PathElement, Route } from '../model/types'

/*
  * Sequence of events that occur from navigation start to end.
 */

export const EventTypes = {
  INITIAL: 'INITIAL',
  NAVIGATION_START: 'NAVIGATION_START',
  PATH_NOT_FOUND: 'PATH_NOT_FOUND',
  CHILDREN_CONFIG_LOAD: 'CHILDREN_CONFIG_LOAD',
  CHILDREN_LOAD: 'CHILDREN_LOAD',
  NAVIGATION_RETRY: 'NAVIGATION_RETRY',
  NAVIGATION_BEFORE_ACTIVATE: 'NAVIGATION_BEFORE_ACTIVATE',
  NAVIGATION_AFTER_ACTIVATE: 'NAVIGATION_AFTER_ACTIVATE',
  NAVIGATION_CANCELLED: 'NAVIGATION_CANCELLED',
  NAVIGATION_ERROR: 'NAVIGATION_ERROR',
  NAVIGATION_SUCCESS: 'NAVIGATION_SUCCESS',
  NAVIGATION_END: 'NAVIGATION_END'
}

export type Event =
  | Initial
  | NavigationStart
  | PathNotFound
  | ChildrenConfigLoad
  | ChildrenLoad
  | NavigationRetry
  | NavigationBeforeActivate
  | NavigationAfterActivate
  | NavigationError
  | NavigationCancelled
  | NavigationEnd

export type Initial = {
  type: 'INITIAL',
  etc?: any
}

export type NavigationStart = {
  type: 'NAVIGATION_START',
  navigation: Navigation,
  etc?: any
}

export type PathNotFound = {
  type: 'PATH_NOT_FOUND',
  navigation: Navigation,
  pathElements: PathElement<*, *>[],
  etc?: any
}

export type ChildrenConfigLoad = {
  type: 'CHILDREN_CONFIG_LOAD',
  navigation: Navigation,
  pathElements: PathElement<*, *>[],
  leaf: PathElement<*, *>,
  module: any,
  etc?: any
}

export type ChildrenLoad = {
  type: 'CHILDREN_LOAD',
  navigation: Navigation,
  pathElements: PathElement<*, *>[],
  leaf: PathElement<*, *>,
  children: any,
  etc?: any
}

export type NavigationRetry = {
  type: 'NAVIGATION_RETRY',
  navigation: Navigation,
  pathElements: PathElement<*, *>[],
  continueFrom: PathElement<*, *>,
  etc?: any
}

export type NavigationBeforeActivate = {
  type: 'NAVIGATION_BEFORE_ACTIVATE',
  navigation: Navigation,
  routes: Route<*, *>[],
  etc?: any
}

export type NavigationAfterActivate = {
  type: 'NAVIGATION_AFTER_ACTIVATE',
  navigation: Navigation,
  routes: Route<*, *>[],
  entering: Route<*, *>[],
  exiting: Route<*, *>[],
  etc?: any
}

export type NavigationCancelled = {
  type: 'NAVIGATION_CANCELLED',
  nextNavigation: Navigation,
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
