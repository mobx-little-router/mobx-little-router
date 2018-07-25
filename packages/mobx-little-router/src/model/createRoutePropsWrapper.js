// @flow
import type { Route, RouteProps } from './types'

type RoutePropsWrapper = RouteProps & {
  getParent: () => ?RoutePropsWrapper,
  getAncestor: (key: string) => ?RoutePropsWrapper
}

export default function createRoutePropsWrapper(route: Route<*, *>, useNode: boolean = false): RoutePropsWrapper {
  const parent = route.ancestors[route.ancestors.length - 1]

  const { current } = route.node.value

  const wrapped = {
    params: useNode ? current.params : route.params,
    query: useNode ? current.query : route.query,
    getParent(): ?RoutePropsWrapper {
      return parent
        ? createRoutePropsWrapper(parent, useNode)
        : null
    },
    getAncestor(key: string): ?RoutePropsWrapper {
      const ancestor = route.ancestors.find((x) => x.node.value.key === key)
      return ancestor
        ? createRoutePropsWrapper(ancestor, useNode)
        : null
    }
  }

  const { defineProperty } = Object
  defineProperty(wrapped, 'state', {
    enumerable: true,
    get() {
      return useNode ? current.state : route.state
    }
  })

  defineProperty(wrapped, 'computed', {
    enumerable: true,
    get() {
      return useNode ? current.computed : route.computed
    }
  })

  return ((wrapped: any): RoutePropsWrapper)
}