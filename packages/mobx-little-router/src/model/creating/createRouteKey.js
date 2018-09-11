import type { RouteStateTreeNode } from '../types'

export default function createRouteKey(node: RouteStateTreeNode<*, *>, id: string) {
  return `${node.value.key}/${createHash(id)}`
}

export const createHash = (subject: string): string => {
  let hval = 0x811c9dc5

  for (let i = 0, l = subject.length; i < l; i++) {
    hval ^= subject.charCodeAt(i)
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
  }

  // Convert to 8 digit hex string
  return ("0000000" + (hval >>> 0).toString(16)).substr(-8)
}
