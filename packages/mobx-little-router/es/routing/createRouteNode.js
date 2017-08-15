
import { TreeNode } from '../util/tree';

import createKey from '../util/createKey';
import UrlPattern from 'url-pattern';

function alwaysContinue(__, ___) {
  return Promise.resolve();
}

export default function createRouteNode(config) {
  return new TreeNode({
    key: createKey(6),
    path: config.path,
    pattern: config.path !== '' ? new UrlPattern(config.path) : null,
    data: config.data || {},
    params: null,
    isActive: false,
    hooks: {
      canActivate: config.canActivate || [alwaysContinue],
      onEnter: config.onEnter || [alwaysContinue],
      onError: config.onError || [],
      onLeave: config.onLeave || [alwaysContinue],
      canDeactivate: config.canDeactivate || [alwaysContinue]
    }
  }, config.children ? config.children.map(createRouteNode) : []);
}