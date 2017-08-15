import _regeneratorRuntime from 'babel-runtime/regenerator';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { NoMatch } from '../errors';


export default (function () {
  var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(parts, path) {
    var idx, handler, _loop;

    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(parts.length === path.length)) {
              _context.next = 4;
              break;
            }

            return _context.abrupt('return');

          case 4:
            if (!(parts.length === path.length + 1 && parts[parts.length - 1] === '')) {
              _context.next = 6;
              break;
            }

            return _context.abrupt('return');

          case 6:

            // Try to recover from error by bubbling the error from last matched no, to the first.
            idx = path.length - 1;

            // Default handler will reject with error.

            handler = Promise.reject();

            _loop = function _loop() {
              var result = path[idx];
              var hooks = result.node.value.hooks;
              // Reduce from handler until it resolves.

              handler = hooks.onError ? hooks.onError.reduce(function (acc, handler) {
                return acc.catch(function () {
                  return handler(result.node, result.params);
                });
              }, handler) : handler;
              idx--;
            };

            while (idx >= 0) {
              _loop();
            }

            // Handler will either bubble rejection until it resolves, or rejects.
            _context.prev = 10;
            _context.next = 13;
            return handler;

          case 13:
            _context.next = 18;
            break;

          case 15:
            _context.prev = 15;
            _context.t0 = _context['catch'](10);
            throw new NoMatch(parts, path);

          case 18:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[10, 15]]);
  }));

  function matchResults(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return matchResults;
})();