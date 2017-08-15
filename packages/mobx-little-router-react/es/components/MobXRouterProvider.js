var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Children, Component } from 'react';
import { RouterStore } from 'mobx-little-router';
import { RouterType } from './propTypes';

var MobXRouterProvider = function (_Component) {
  _inherits(MobXRouterProvider, _Component);

  function MobXRouterProvider() {
    _classCallCheck(this, MobXRouterProvider);

    return _possibleConstructorReturn(this, (MobXRouterProvider.__proto__ || Object.getPrototypeOf(MobXRouterProvider)).apply(this, arguments));
  }

  _createClass(MobXRouterProvider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        router: {
          store: this.props.module.store,
          history: this.props.module.history
        }
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return Children.only(this.props.children);
    }
  }]);

  return MobXRouterProvider;
}(Component);

MobXRouterProvider.childContextTypes = {
  router: RouterType
};
export default MobXRouterProvider;