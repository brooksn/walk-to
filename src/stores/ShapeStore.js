import Dispatcher from '../core/Dispatcher.js';
import merge from 'lodash/object/merge';
import EventEmitter from 'eventemitter3';

//var EE = new EventEmitter();

let shapestore = {
  sqlUtf8String: null,
  hasSqlUtf8String: false,
  downloadurl: null,
};

var ShapeStore = merge(EventEmitter.prototype, {
  getSqlString: function(){
    return shapestore.sqlUtf8String;
  },
  emitChange: function(){
    this.emit('change', shapestore);
  },
  addChangeListener: function(callback) {
    this.on('change', callback);
  }
});


Dispatcher.register(function(action){
  switch(action.actionType) {
    case 'receivedSQLstring':
      if (action.text.length < 9) break;
      shapestore.sqlUtf8String = action.text;
      shapestore.hasSqlUtf8String = true;
      //EE.emit('availableSQLstring', shapestore);
      break;
    case 'receivedSQLurl':
      if (action.url.length < 2) break;
      shapestore.downloadurl = action.url;
      break;
    default:
      return true;
      break;
  }
  ShapeStore.emitChange();
  return true;
});

export default ShapeStore;
