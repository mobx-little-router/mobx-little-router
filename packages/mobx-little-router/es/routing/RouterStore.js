var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { extendObservable, runInAction, observable } from 'mobx';

import RouterStateTree from './RouterStateTree';

import createRouteNode from './createRouteNode';

var RouterStore = function () {

  // Create a map of all nodes in tree so we can perform faster lookup.
  // Instances should be exactly the same as in state tree.
  function RouterStore(children) {
    _classCallCheck(this, RouterStore);

    var root = createRouteNode({ path: '', onError: [this.handleRootError] }); // Initial root.
    this.state = new RouterStateTree(root);

    extendObservable(this, {
      location: null,
      error: null,
      cache: observable.map(_defineProperty({}, root.value.key, root)),
      activeNodes: observable.array([])
    });

    if (children) {
      this.replaceChildren(root, children);
    }
  }

  /* Queries */

  // Ensures we always get the matched copy from state.


  // Keep a list of activated nodes so we can track differences when
  // transitioning to a new state.


  _createClass(RouterStore, [{
    key: 'getNode',
    value: function getNode(x) {
      var existing = this.cache.get(x.value.key);
      if (existing) {
        return existing;
      } else {
        throw new Error('Node not found in state tree.');
      }
    }

    /* Mutations */

  }, {
    key: 'replaceChildren',
    value: function replaceChildren(parent, nodes) {
      var _this = this;

      var existing = this.getNode(parent);
      runInAction(function () {
        existing.children.replace(nodes);
        nodes.forEach(function (child) {
          _this.cache.set(child.value.key, child);
          _this.replaceChildren(child, child.children.slice());
        });
      });
    }
  }, {
    key: 'updateNode',
    value: function updateNode(node, updates) {
      var existing = this.getNode(node);
      runInAction(function () {
        Object.assign(existing.value, updates);
      });
    }
  }, {
    key: 'activateNodes',
    value: function activateNodes(nodes) {
      var _this2 = this;

      runInAction(function () {
        _this2.activeNodes.replace(nodes);
      });
    }
  }, {
    key: 'setLocation',
    value: function setLocation(next) {
      var _this3 = this;

      runInAction(function () {
        _this3.location = next;
      });
    }
  }, {
    key: 'setError',
    value: function setError(err) {
      var _this4 = this;

      runInAction(function () {
        _this4.error = err;
      });
    }
  }, {
    key: 'handleRootError',
    value: function handleRootError(err) {
      var _this5 = this;

      runInAction(function () {
        _this5.error = err;
      });
      return Promise.reject(err);
    }
  }]);

  return RouterStore;
}();

export default RouterStore;