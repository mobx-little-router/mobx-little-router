// @flow
import Navigation from '../../model/Navigation'
import QueryString from 'qs'
import transformNavigation from '../../middleware/transformNavigation'

export default transformNavigation(navigation => {
  const { to } = navigation
  if (to && typeof to.search === 'string') {
    return new Navigation({
      ...navigation,
      to: { ...to, query: QueryString.parse(to.search.substr(1)) }
    })
  }
  return navigation
})
