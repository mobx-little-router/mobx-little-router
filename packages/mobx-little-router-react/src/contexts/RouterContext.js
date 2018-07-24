// @flow
import type { Router } from 'mobx-little-router'
import createContext from 'create-react-context';

export type RouterContextValue = null | Router

const RouterContext = createContext((null: RouterContextValue))

export default RouterContext
