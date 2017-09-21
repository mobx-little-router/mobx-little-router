// @flow
import Middleware from '../Middleware'
import { runInAction } from 'mobx'
import { EventTypes } from '../../events'
import type { Event } from '../../events'

export class ConfigurationError {
  message: string
  constructor(message: string) {
    this.message = message
  }
}

const __NODE_HASH__ = '@devTools/__NODE_HASH__'
const __NODE_SPECIFICITY__ = '@devTools/__NODE_SPECIFICITY__'

const validateConfigMiddleware = Middleware((evt: Event): Event => {
  if (EventTypes.CHILDREN_LOADED === evt.type) {
    mark(evt.leaf.node, evt.leaf.node.children) // Only mark from the last visited leaf and its children.
    validateOrdering(evt.leaf.node, evt.leaf.node.children)
    validatePathUniqueness(evt.root, evt.root.children) // Validate the entire tree again.
  }
  return evt
})

function mark(parent, children) {
  walk(parent, children, (parent, child) => {
    const parentPath = parent == null ? '' : parent.value.path
    const segment = parentPath === '/' ? toStub(child) : `${parentPath}${toStub(child)}`
    child.value.etc = {
      ...child.value.etc,
      [__NODE_HASH__]: segment,
      [__NODE_SPECIFICITY__]: toSpecificity(child)
    }
  })
}

function validateOrdering(parent, children) {
  let curr = Infinity
  for (const child of children) {
    const { [__NODE_SPECIFICITY__]: specificity } = child.value.etc
    if (specificity > curr) {
      throw new ConfigurationError(
        `Unreachable child routes detected from "${parent.value
          .path}". Please check your config [${children
          .map(x => `"${x.value.path}"`)
          .join(', ')}].`
      )
    }
    curr = specificity
  }
}

function validatePathUniqueness(parent, children) {
  const seen = new Map()
  walk(parent, children, (parent, child) => {
    const { [__NODE_HASH__]: hash } = child.value.etc
    const existing = seen.get(hash)
    if (child.children.length > 0) {
      return
    }

    if (existing) {
      throw new ConfigurationError(
        `URL "${hash}" matched at nodes key=${child.value.key} and key=${existing.value
          .key}`
      )
    }
    seen.set(hash, child)
  })
}

function walk(parent, children, visitor) {
  if (!parent) return
  for (const child of children) {
    visitor(parent, child)
    walk(child, child.children, visitor)
  }
}

function toStub(node): string {
  let segment = node.value.path.replace(/(:.+?)/g, 'any')
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

// Max value is 99999, which is when a route has no params and is a full match.
function toSpecificity(node): number {
  let path = node.value.path
  path = path.startsWith('/') ? path.substr(1) : path
  const parts = path.split('/')
  let pos = 10000
  return parts.reduce((acc, x) => {
    const y = acc - (2 - specificity(x, node.value.matcher.type === 'full')) * pos
    pos = pos / 10
    return y
  }, 99999)
}

function specificity(part, isFull) {
  if (part === '' && !isFull) {
    return 0
  }
  if (part.startsWith(':')) {
    return 1
  }
  return 2
}

export default validateConfigMiddleware
