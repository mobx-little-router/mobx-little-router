// @flow
import Middleware from '../Middleware'
import { runInAction } from 'mobx'
import { EventTypes } from '../../events'
import type { Event } from '../../events'
import findPathFromRoot from '../../model/util/findPathFromRoot'

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message)
  }
}

const __NODE_CHILD_URLS__ = '@devTools/__NODE_CHILD_URLS__'

const validateConfigMiddleware = Middleware((evt: Event): Event => {
  if (EventTypes.CHILDREN_LOADED === evt.type) {
    mark(evt.leaf.node, evt.leaf.node.children)
    validate(evt.leaf.node, evt.leaf.node.children)
  }
  return evt
})

function mark(root, children) {
  const urls = root.value.etc.__NODE_CHILD_URLS__ || []
  root.value.etc = {
    ...root.value.etc,
    [__NODE_CHILD_URLS__]: urls
  }
  walk(root, children, (parent, child) => {
    if (child.value.matcher.type === 'any') {
      return
    }
    const parentPath = parent == null ? '' : parent.value.path
    const segment = normalize(parentPath === '/' ? toStub(child) : `${parentPath}${toStub(child)}`)
    urls.push(segment)
  })
}

function validate(root, children) {
  const seen = new Set()
  const paths = root.value.etc[__NODE_CHILD_URLS__].map(x =>
    findPathFromRoot(root, x)
  )
  paths.forEach(path =>
    path.forEach(x => {
      seen.add(x.node)
    })
  )
  walk(root, children, (parent, child) => {
    if (child.children.length === 0 && !seen.has(child)) {
      throw new ConfigurationError(
        `Unreachable route paths detected at "${parent.value
          .path}". Please check your children configuration [${children
          .map(x => `"${x.value.path}"`)
          .join(', ')}]`
      )
    }
  })
}

function walk(parent, children, visitor) {
  if (!parent) return
  for (const child of children) {
    visitor(parent, child)
    walk(child, child.children, visitor)
  }
}

function normalize(x) {
  return x.startsWith('/') ? x : `/${x}`
}

function toStub(node): string {
  let segment = node.value.path.replace(/(:.+)/g, '__ANY__')
  segment = segment.startsWith('/') ? segment : `/${segment}`
  let result = node.value.matcher(segment)
  if (result.matched) {
    return result.segment
  }
  result = node.value.matcher('/')
  if (result.matched) {
    return result.segment || '/'
  }
  return '/'
}

export default validateConfigMiddleware
