import _regeneratorRuntime from 'babel-runtime/regenerator';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { findPath } from '../util/tree';


export default (function () {
  var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(node, path) {
    var matched;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            matched = [];
            _context.next = 3;
            return findPath(function (node, segment) {
              var _node$value = node.value,
                  pattern = _node$value.pattern,
                  path = _node$value.path;

              // Try to match pattern if it exists.

              if (pattern !== null) {
                var params = pattern.match(segment);
                if (params !== null) {
                  matched.push({ node: node, segment: segment, params: params });
                  return Promise.resolve(true);
                }
                // If pattern does not existing, we need to match on empty string (index route).
              } else if (path === segment) {
                matched.push({ node: node, segment: segment, params: {} });
                return Promise.resolve(true);
              }

              // No match.
              return Promise.resolve(false);
            }, node, path);

          case 3:
            return _context.abrupt('return', matched);

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function pathFromRoot(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return pathFromRoot;
})();