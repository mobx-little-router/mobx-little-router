import _regeneratorRuntime from 'babel-runtime/regenerator';

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { extendObservable, observable } from 'mobx';


export var TreeNode = function TreeNode(value, children) {
  _classCallCheck(this, TreeNode);

  extendObservable(this, {
    value: value,
    children: observable.array(children)
  });
};

// Asynchronous DFS from root node for a matching path based on return of visitor function.
export var findPath = function () {
  var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(visitor, node, path) {
    var _path, curr, rest, result, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, child, _path2;

    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _path = _toArray(path), curr = _path[0], rest = _path.slice(1);

            // No more segments to parse.

            if (!(curr === undefined)) {
              _context.next = 3;
              break;
            }

            return _context.abrupt('return', []);

          case 3:
            _context.next = 5;
            return visitor(node, curr);

          case 5:
            result = _context.sent;

            if (!result) {
              _context.next = 38;
              break;
            }

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 10;
            _iterator = node.children[Symbol.iterator]();

          case 12:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 23;
              break;
            }

            child = _step.value;
            _context.next = 16;
            return findPath(visitor, child, rest);

          case 16:
            _path2 = _context.sent;

            if (!(_path2.length > 0)) {
              _context.next = 20;
              break;
            }

            _path2.unshift(node);
            return _context.abrupt('return', _path2);

          case 20:
            _iteratorNormalCompletion = true;
            _context.next = 12;
            break;

          case 23:
            _context.next = 29;
            break;

          case 25:
            _context.prev = 25;
            _context.t0 = _context['catch'](10);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 29:
            _context.prev = 29;
            _context.prev = 30;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 32:
            _context.prev = 32;

            if (!_didIteratorError) {
              _context.next = 35;
              break;
            }

            throw _iteratorError;

          case 35:
            return _context.finish(32);

          case 36:
            return _context.finish(29);

          case 37:
            return _context.abrupt('return', [node]);

          case 38:
            return _context.abrupt('return', []);

          case 39:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[10, 25, 29, 37], [30,, 32, 36]]);
  }));

  return function findPath(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

// DFS for finding a matching node by predicate.
export function findNode(predicate, node) {
  if (predicate(node)) return node;

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = node.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var child = _step2.value;

      var _node = findNode(predicate, child);
      if (_node) return _node;
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return null;
}