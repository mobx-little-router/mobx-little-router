// @flow
import QueryString from 'qs'
import transformNavigation from './transformNavigation'
import { runInAction } from 'mobx'

export default transformNavigation(navigation => {
  const { to } = navigation
  if (to && typeof to.search === 'string' && to.search.length > 1) {
    runInAction(() => {
      navigation.to = { ...to, query: QueryString.parse(to.search.substr(1)) }
    })
  }
  return navigation
})
