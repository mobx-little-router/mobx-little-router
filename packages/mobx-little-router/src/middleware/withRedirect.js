// @flow
// If a `redirectTo` has been specified on this route config, then the `willActivate`
// callback will redirect throw with a redirect.
import UrlPattern from 'url-pattern'
import type { Config, Route } from '../model/types'
import Navigation from '../model/Navigation'
import transformConfig from './transformConfig'

async function NOP(a: *, b: *) {}

export default transformConfig((config: Config<*>) => {
  if (typeof config.redirectTo === 'string') {
    const _willActivate = typeof config.willActivate === 'function'
      ? config.willActivate
      : NOP
    const pattern = new UrlPattern(config.redirectTo)

    const willActivate = (route: Route<*, *>, navigation: Navigation) => {
      _willActivate(route, navigation)
      const url = pattern.stringify(route.params)
      return navigation.redirectTo(
        url.startsWith('/') ? url : `${route.parentUrl}/${url}`
      )
    }
    return { ...config, willActivate }
  } else {
    return config
  }
})
