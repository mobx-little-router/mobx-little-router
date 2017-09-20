// @flow
import Middleware from '../Middleware'
import { runInAction } from 'mobx'
import { EventTypes } from '../../events'
import type { Event } from '../../events'

export class ConfigurationError {
  message: string
  nodeA: any
  nodeB: any
  constructor(message: string, a: any, b: any) {
    this.message = message
    this.nodeA = a
    this.nodeB = b
  }
}

const __CONFIG_VALIDATION_HASH__ = '__CONFIG_VALIDATION_HASH__'

const validateConfigMiddleware = Middleware((evt: Event): Event => {
  switch (evt.type) {
    case EventTypes.CHILDREN_LOADED: {
      mark(evt.leaf.node, evt.leaf.node.children)
      validate(evt.root, evt.root.children)
      return evt
    }
    default:
      return evt
  }
})

function mark(parent, children) {
  walk(parent, children, (parent, child) => {
    const parentPath = parent == null ? '' : parent.value.path
    const segment = parentPath === '/' ? toStub(child) : `${parentPath}${toStub(child)}`
    child.value.etc = {
      ...child.value.etc,
      [__CONFIG_VALIDATION_HASH__]: segment
    }
  })
}

function validate(parent, children) {
  const seen = new Map()
  walk(parent, children, (parent, child) => {
    const { [__CONFIG_VALIDATION_HASH__]: hash } = child.value.etc
    const existing = seen.get(hash)
    if (child.children.length > 0) {
      return
    }

    if (existing) {
      throw new ConfigurationError(
        `URL "${hash}" matched at nodes key=${child.value.key} and key=${existing.value.key}`,
        child,
        existing
      )
    }
    seen.set(hash, child)
  })
}

function walk(parent, children, visitor) {
  if (!parent)
    return
  for (const child of children) {
    visitor(parent, child)
    walk(child, child.children, visitor)
  }
}

function toStub(node): string {
  let segment = node.value.path.replace('any', /:.+?/g)
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
