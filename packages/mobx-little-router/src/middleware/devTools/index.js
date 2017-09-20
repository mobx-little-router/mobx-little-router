// @flow
const devTools = process.env.NODE_ENV === 'development'
  ? require('./validateConfigMiddleware').default
  : require('../Middleware').default.EMPTY

export default devTools
