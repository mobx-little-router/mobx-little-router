// @flow
import type {Location, PathElement, Query, Route, RouteStateTreeNode} from '../../model/types'
import createRouteInstance from '../../model/creating/createRouteInstance'
import qs from "querystring";

export default function createIncomingRoutes(
  initialActivatedRoutes: Object,
  path: PathElement<*, *>[],
  nextLocation: Location
): Route<*, *>[] {
  const query = getQueryParams(nextLocation)

  return path.map(element => {
    const { node, parentUrl, segment, params } = element
    const matchedQueryParams = getMatchedQueryParams(node, query)
    const initialRoute = initialActivatedRoutes[node.value.key]
    return createRouteInstance(node, parentUrl, segment, params, matchedQueryParams)
  })
}

function getQueryParams(location: Location): Query {
  return location.search != null ? qs.parse(location.search.substr(1)) : {}
}


function getMatchedQueryParams(node: RouteStateTreeNode<*, *>, query: Query): Query {
  return node.value.query.reduce((acc, key) => {
    acc[key] = query[key]
    return acc
  }, {})
}

