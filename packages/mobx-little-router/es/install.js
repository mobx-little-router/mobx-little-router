import RouterStore from './routing/RouterStore';
import createRouteNode from './routing/createRouteNode';
import HistoryManager from './history/HistoryManager';


export default function install(opts) {
  var store = new RouterStore(opts.routes.map(createRouteNode));
  var manager = new HistoryManager(opts.createHistory, store);
  return {
    history: manager.history,
    store: store,
    start: function start() {
      return manager.start();
    },
    stop: function stop() {
      return manager.stop();
    }
  };
}