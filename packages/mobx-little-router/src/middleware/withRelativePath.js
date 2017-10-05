// @flow
import Navigation from '../model/Navigation'
import transformNavigation from './transformNavigation'
import { resolve } from '../util/path'

export default transformNavigation((navigation, store) => {
  const { to } = navigation
  if (to && store.location.pathname) {
    return new Navigation({
      ...navigation,
      to: { ...to, pathname: resolve(store.location.pathname, to.pathname) }
    })
  }
  return navigation
})
