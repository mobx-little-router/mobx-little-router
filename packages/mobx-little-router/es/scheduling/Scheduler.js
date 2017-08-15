import _regeneratorRuntime from 'babel-runtime/regenerator';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { autorun, extendObservable, observable, runInAction } from 'mobx';

import matchResults from '../matching/matchResults';

import areNodesEqual from '../routing/areNodesEqual';
import shallowEqual from '../util/shallowEqual';
import { differenceWith } from '../util/functional';
import { GuardFailure } from '../errors';

var Scheduler = function () {
  function Scheduler(store) {
    var _this = this;

    _classCallCheck(this, Scheduler);

    this.scheduleTransition = function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(callback) {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                callback(true);

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }();

    this.scheduleNavigation = function (nextLocation, action) {
      var location = _this.store.location;

      // If location path and query has not changed, skip it.

      if (location && location.pathname === nextLocation.pathname && location.query && shallowEqual(location.query, nextLocation.query)) {
        return;
      }

      var pathname = normalizePath(nextLocation.pathname);

      runInAction(function () {
        _this.navigation = {
          location: _extends({}, nextLocation, {
            pathname: pathname
          }),
          parts: pathname.split('/'),
          action: action
        };
      });
    };

    this.processNavigation = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
      var navigation, location, parts, path;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              navigation = _this.navigation;

              if (navigation) {
                _context2.next = 3;
                break;
              }

              return _context2.abrupt('return');

            case 3:
              location = navigation.location, parts = navigation.parts;
              _context2.prev = 4;
              _context2.next = 7;
              return _this.store.state.pathFromRoot(parts);

            case 7:
              path = _context2.sent;
              _context2.next = 10;
              return matchResults(parts, path);

            case 10:
              _context2.next = 12;
              return _this.doActivate(path);

            case 12:
              _this.store.setLocation(location);
              _context2.next = 18;
              break;

            case 15:
              _context2.prev = 15;
              _context2.t0 = _context2['catch'](4);

              _this.store.setError(_context2.t0);

            case 18:
              _context2.prev = 18;

              _this.clearNavigation();
              return _context2.finish(18);

            case 21:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this, [[4, 15, 18, 21]]);
    }));

    this.doActivate = function () {
      var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(activating) {
        var deactivating;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                deactivating = differenceWith(areNodesEqual, _this.store.activeNodes.slice(), activating.map(function (x) {
                  return x.node;
                })).map(function (node) {
                  return {
                    node: node,
                    segment: '',
                    params: node.value.params || {}
                  };
                }).reverse();

                // Make sure we can deactivate nodes first. We need to map deactivating nodes to a MatchResult object.

                _context3.next = 4;
                return _this.runGuards('canDeactivate', [], deactivating);

              case 4:
                _context3.next = 6;
                return _this.runGuards('canActivate', [], activating);

              case 6:
                _context3.next = 11;
                break;

              case 8:
                _context3.prev = 8;
                _context3.t0 = _context3['catch'](0);
                throw _context3.t0;

              case 11:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this, [[0, 8]]);
      }));

      return function (_x2) {
        return _ref3.apply(this, arguments);
      };
    }();

    this.runGuards = function () {
      var _ref4 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(type, processed, remaining) {
        var _remaining, curr, rest, params, node, hooks, guard;

        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _remaining = _toArray(remaining), curr = _remaining[0], rest = _remaining.slice(1);

                // Done!

                if (curr) {
                  _context4.next = 3;
                  break;
                }

                return _context4.abrupt('return');

              case 3:
                params = curr.params, node = curr.node;
                hooks = node.value.hooks;
                guard = hooks[type].reduce(function (acc, f) {
                  return acc.then(function () {
                    return f(node, params).catch(function (error) {
                      throw new GuardFailure(error, node, params);
                    });
                  });
                }, Promise.resolve());
                _context4.prev = 6;
                _context4.next = 9;
                return guard;

              case 9:
                _context4.next = 11;
                return _this.runGuards(type, [curr], rest);

              case 11:
                _context4.next = 16;
                break;

              case 13:
                _context4.prev = 13;
                _context4.t0 = _context4['catch'](6);
                throw _context4.t0;

              case 16:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this, [[6, 13]]);
      }));

      return function (_x3, _x4, _x5) {
        return _ref4.apply(this, arguments);
      };
    }();

    this.store = store;
    this.disposer = null;
    extendObservable(this, {
      navigation: null
    });
  }

  _createClass(Scheduler, [{
    key: 'start',
    value: function start() {
      this.disposer = autorun(this.processNavigation);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.disposer && this.disposer();
      this.disposer = null;
    }
  }, {
    key: 'clearNavigation',
    value: function clearNavigation() {
      var _this2 = this;

      runInAction(function () {
        _this2.navigation = null;
      });
    }
  }]);

  return Scheduler;
}();

export default Scheduler;


function normalizePath(x) {
  if (x.endsWith('/')) {
    return x;
  } else {
    return x + '/';
  }
}