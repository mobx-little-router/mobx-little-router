import type { RoutesChangeSet, Route } from '../../model/types'
import areRoutesEqual from '../../model/util/areRoutesEqual'

export default function createRoutesChangeSet(
  currRoutes: Route<*, *>[],
  incomingRoutes: Route<*, *>[]
): RoutesChangeSet {
  let parentWillResolve

  // Exiting this specific route instance
  const exiting = currRoutes
    .reduce((acc, x, idx) => {
      const y = incomingRoutes.length > idx ? incomingRoutes[idx] : undefined
      if (acc.length > 0 || !areRoutesEqual(x, y)) {
        acc.push(x)
      }
      return acc
    }, [])
    .reverse()

  // Entering this specific route instance
  const entering = incomingRoutes.reduce((acc, x, idx) => {
    const y = currRoutes.length > idx ? currRoutes[idx] : undefined
    if (acc.length > 0 || !areRoutesEqual(x, y)) {
      acc.push(x)
    }
    return acc
  }, [])

  // Deactivating this route state tree node
  parentWillResolve = false
  const deactivating = currRoutes
    .reduce((acc, x, idx) => {
      const y = incomingRoutes.length > idx ? incomingRoutes[idx] : undefined
      if (acc.length > 0 || parentWillResolve || x.node !== (y && y.node)) {
        acc.push(x)
      }
      if (!areRoutesEqual(x, y)) {
        parentWillResolve = true
      }
      return acc
    }, [])
    .reverse()

  // Activating this route state tree node
  parentWillResolve = false
  const activating = incomingRoutes.reduce((acc, x, idx) => {
    const y = currRoutes.length > idx ? currRoutes[idx] : undefined
    if (acc.length > 0 || parentWillResolve || x.node !== (y && y.node)) {
      acc.push(x)
    }
    if (!areRoutesEqual(x, y)) {
      parentWillResolve = true
    }
    return acc
  }, [])

  return { incomingRoutes, activating, deactivating, entering, exiting }
}
