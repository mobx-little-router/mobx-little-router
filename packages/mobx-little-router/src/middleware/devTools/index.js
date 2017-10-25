// @flow
import logErrorsMiddleware from './logErrorsMiddleware'
import timerMiddleware from './timerMiddleware'
import Middleware from '../Middleware'

const devTools = process.env.NODE_ENV !== 'production'
  ? logErrorsMiddleware.concat(timerMiddleware(() => Date.now()))
  : Middleware.EMPTY

export default devTools
