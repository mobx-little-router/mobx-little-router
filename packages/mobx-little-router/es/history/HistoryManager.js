var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import RouterStore from '../routing/RouterStore';

import Scheduler from '../scheduling/Scheduler';

var HistoryManager = function () {
  function HistoryManager(historyCreator, store) {
    var _this = this;

    _classCallCheck(this, HistoryManager);

    this.scheduleTransition = function (__, callback) {
      _this.scheduler.scheduleTransition(callback);
    };

    this.dispose = null;

    this.history = historyCreator({
      getUserConfirmation: this.scheduleTransition
    });

    // Block history on every transition, and we'll let the scheduler handle the lifecycle.
    this.history.block(''); // This message is never actually used, just a placeholder.

    this.scheduler = new Scheduler(store);
    this.store = store;
  }

  _createClass(HistoryManager, [{
    key: 'start',
    value: function start() {
      var _this2 = this;

      this.scheduler.start();
      this.dispose = this.history.listen(function (location, action) {
        _this2.scheduler.scheduleNavigation(location, action);
      });
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.scheduler.stop();
      this.dispose && this.dispose();
    }

    // TODO: THis should push the callback into a queue somewhere so we can pick it up in scheduler.

  }]);

  return HistoryManager;
}();

export default HistoryManager;