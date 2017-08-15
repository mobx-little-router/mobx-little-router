import _regeneratorRuntime from 'babel-runtime/regenerator';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { observable, extendObservable } from 'mobx';
import { findNode } from '../util/tree';

import _pathFromRoot from '../matching/pathFromRoot';

var RouterStateTree = function () {
  function RouterStateTree(root) {
    _classCallCheck(this, RouterStateTree);

    extendObservable(this, {
      root: root
    });
  }

  _createClass(RouterStateTree, [{
    key: 'find',
    value: function find(predicate) {
      return findNode(predicate, this.root);
    }

    // TODO: We should handle `loadChildren` to resolve dynamically. See: #2

  }, {
    key: 'pathFromRoot',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(path) {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', _pathFromRoot(this.root, path));

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function pathFromRoot(_x) {
        return _ref.apply(this, arguments);
      }

      return pathFromRoot;
    }()
  }]);

  return RouterStateTree;
}();

export default RouterStateTree;