// @flow
import Navigation from '../model/Navigation'
import QueryString from 'qs'
import transformNavigation from './transformNavigation'

export default transformNavigation(navigation => {
  const { to } = navigation
  
  if (to) {
    const query = typeof to.search === 'string' && to.search.length > 1
      ? QueryString.parse(to.search.substr(1))
      : {}

    return new Navigation({
      ...navigation,
      to: { ...to, query }
    })
  }

  return navigation
})
