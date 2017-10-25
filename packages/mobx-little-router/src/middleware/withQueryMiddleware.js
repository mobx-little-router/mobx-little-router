// @flow
import Navigation from '../model/Navigation'
import qs from 'querystring'
import transformNavigation from './transformNavigation'

export default transformNavigation(navigation => {
  const { to } = navigation
  
  if (to) {
    const query = typeof to.search === 'string' && to.search.length > 1
      ? qs.parse(to.search.substr(1))
      : {}

    return new Navigation({
      ...navigation,
      to: { ...to, query }
    })
  }

  return navigation
})
