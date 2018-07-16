// @flow
import type RouterStore from '../../model/RouterStore'
import type { CurrentRouteProperties } from '../../model/types'

type CurrentRoutePropertiesWrapper = CurrentRouteProperties & {
  getParent: () => ?CurrentRoutePropertiesWrapper,
  getAncestor: (key: string) => ?CurrentRoutePropertiesWrapper
}

export default function createCurrentRoutePropertiesWrapper(key: string, store: RouterStore): ?CurrentRoutePropertiesWrapper {
  const node = store.getNode(key)
  const ancestors = store.getNodeAncestors(key)
  const parent = ancestors[0]
  
  if (!node) { return null }

  const wrapped = {
    getParent(): ?CurrentRoutePropertiesWrapper {
      return parent
        ? createCurrentRoutePropertiesWrapper(parent.value.key, store)
        : null
    },
    getAncestor(key: string): ?CurrentRoutePropertiesWrapper {
      const ancestor = ancestors.find(node => node.value.key === key)
      return ancestor
        ? createCurrentRoutePropertiesWrapper(ancestor.value.key, store)
        : null
    },
    params: node.value.current.params,
    query: node.value.current.query
  }

  // Workaround for flow
  const { defineProperty } = Object

  defineProperty(wrapped, 'computed', {
    get() {
      return node.value.current.computed
    }
  })

  defineProperty(wrapped, 'state', {
    get() {
      return node.value.current.state
    }
  })

  return ((wrapped: any): CurrentRoutePropertiesWrapper)
}
