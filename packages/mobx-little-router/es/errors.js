var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

export var GuardFailure = function GuardFailure(error, node, params) {
  _classCallCheck(this, GuardFailure);

  this.error = error;
  this.node = node;
  this.params = params;
};


export var NoMatch = function () {
  function NoMatch(parts, path) {
    _classCallCheck(this, NoMatch);

    this.parts = parts;
    this.path = path;
  }

  _createClass(NoMatch, [{
    key: 'toString',
    value: function toString() {
      return 'No match for parts ["' + this.parts.join('", "') + '"]';
    }
  }]);

  return NoMatch;
}();