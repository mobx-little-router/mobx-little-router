// @flow
import Navigation from '../model/Navigation'
import type { PathElement, Route, RouteStateTreeNode, Setter } from '../model/types'

/*
  * Sequence of events that occur from navigation start to end.
 */

export const EventTypes = {
  EMPTY: 'EMPTY',
  NAVIGATION_START: 'NAVIGATION_START',
  NAVIGATION_RESULT_MATCHED: 'NAVIGATION_RESULT_MATCHED',
  CHILDREN_CONFIG_REQUESTED: 'CHILDREN_CONFIG_REQUESTED',
  CHILDREN_CONFIG_LOADED: 'CHILDREN_CONFIG_LOADED',
  CHILDREN_LOADING: 'CHILDREN_LOADING',
  CHILDREN_LOADED: 'CHILDREN_LOADED',
  NAVIGATION_RETRY: 'NAVIGATION_RETRY',
  NAVIGATION_NOT_MATCHED: 'NAVIGATION_NOT_MATCHED',
  NAVIGATION_ACTIVATING: 'NAVIGATION_ACTIVATING',
  NAVIGATION_ACTIVATED: 'NAVIGATION_ACTIVATED',
  NAVIGATION_TRANSITION_START: 'NAVIGATION_TRANSITION_START',
  NAVIGATION_TRANSITION_END: 'NAVIGATION_TRANSITION_END',
  NAVIGATION_CANCELLED: 'NAVIGATION_CANCELLED',
  NAVIGATION_ERROR: 'NAVIGATION_ERROR',
  NAVIGATION_END: 'NAVIGATION_END'
}

export type Event =
  | Empty
  | NavigationStart
  | NavigationResultMatched
  | ChildrenConfigRequested
  | ChildrenConfigLoaded
  | ChildrenLoading
  | ChildrenLoaded
  | NavigationRetry
  | NavigationNotMatched
  | NavigationActivating
  | NavigationActivated
  | NavigationTransitionStart
  | NavigationTransitionEnd
  | NavigationError
  | NavigationCancelled
  | NavigationEnd

export type Empty = {
  type: 'EMPTY',
  navigation: null | Navigation,
  setter?: Setter,
  done?: boolean,
  [other: string]: any
}

export type NavigationStart = {
  type: 'NAVIGATION_START',
  navigation: Navigation,
  done?: false,
  [other: string]: any
}

export type NavigationResultMatched = {
  type: 'NAVIGATION_RESULT_MATCHED',
  navigation: Navigation,
  matchedPath: PathElement<*, *>[],
  done?: false,
  [other: string]: any
}

export type ChildrenConfigRequested = {
  type: 'CHILDREN_CONFIG_REQUESTED',
  navigation: Navigation,
  partialPath: PathElement<*, *>[],
  leaf: PathElement<*, *>,
  loader: () => Promise<any>,
  done?: false,
  [other: string]: any
}

export type ChildrenConfigLoaded = {
  type: 'CHILDREN_CONFIG_LOADED',
  navigation: Navigation,
  partialPath: PathElement<*, *>[],
  leaf: PathElement<*, *>,
  module: any,
  setter?: ?Setter,
  done?: false,
  [other: string]: any
}

export type ChildrenLoading = {
  type: 'CHILDREN_LOADING',
  navigation: null | Navigation,
  partialPath: null | PathElement<*, *>[],
  leaf: PathElement<*, *>,
  children: any,
  done?: false,
  [other: string]: any
}

export type ChildrenLoaded = {
  type: 'CHILDREN_LOADED',
  navigation: null | Navigation,
  partialPath: null | PathElement<*, *>[],
  root: RouteStateTreeNode<*, *>,
  leaf: PathElement<*, *>,
  setter?: ?Setter,
  done?: false,
  [other: string]: any
}

export type NavigationRetry = {
  type: 'NAVIGATION_RETRY',
  navigation: Navigation,
  partialPath: PathElement<*, *>[],
  leaf: PathElement<*, *>,
  done?: false,
  [other: string]: any
}

export type NavigationNotMatched = {
  type: 'NAVIGATION_NOT_MATCHED',
  navigation: Navigation,
  matchedPath: PathElement<*, *>[],
  setter?: ?Setter,
  done?: false,
  [other: string]: any
}

export type NavigationActivating = {
  type: 'NAVIGATION_ACTIVATING',
  navigation: Navigation,
  matchedPath: PathElement<*, *>[],
  setter?: ?Setter,
  done?: false,
  [other: string]: any
}

export type NavigationActivated = {
  type: 'NAVIGATION_ACTIVATED',
  navigation: Navigation,
  nextRoutes: Route<*, *>[],
  entering: Route<*, *>[],
  exiting: Route<*, *>[],
  setter?: ?Setter,
  done?: false,
  [other: string]: any
}

export type NavigationTransitionStart = {
  type: 'NAVIGATION_TRANSITION_START',
  navigation: Navigation,
  entering: Route<*, *>[],
  exiting: Route<*, *>[],
  setter?: ?Setter,
  done?: false,
  [other: string]: any
}

export type NavigationTransitionEnd = {
  type: 'NAVIGATION_TRANSITION_END',
  navigation: Navigation,
  entering: Route<*, *>[],
  exiting: Route<*, *>[],
  setter?: ?Setter,
  done?: false,
  [other: string]: any
}

export type NavigationCancelled = {
  type: 'NAVIGATION_CANCELLED',
  navigation: null | Navigation,
  nextNavigation: null | Navigation,
  setter?: ?Setter,
  done: true,
  [other: string]: any
}

export type NavigationError = {
  type: 'NAVIGATION_ERROR',
  navigation: null | Navigation,
  error: any,
  setter?: ?Setter,
  done: true,
  [other: string]: any
}

export type NavigationEnd = {
  type: 'NAVIGATION_END',
  navigation: Navigation,
  setter?: ?Setter,
  done: true,
  [other: string]: any
}
