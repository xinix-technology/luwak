module.exports = {

  defaults: function(obj, def) {
    'use strict';

    obj = obj || {};
    for(var i in def) {
      if (typeof obj[i] === 'undefined') {
        obj[i] = def[i];
      }
    }
    return obj;
  },

  mixin: function(obj, mixObj) {
    'use strict';

    obj = obj || {};

    for(var i in mixObj) {
      obj[i] = mixObj[i];
    }

    return obj;
  },

  extend: function(obj, ext) {
    'use strict';

    if (!obj) {
      throw new Error('Cannot extend non object');
    }

    for(var i in ext) {
      Object.defineProperty(obj, i, {
        enumerable: false,
        writable: false,
        configurable: false,
        value: ext[i],
      });
    }
  },

  flatten: function() {
    var result = [];

    for(var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];
      if (typeof arg === 'object' && (Array.isArray(arg) || arg.toString() === '[object Arguments]')) {
        for(var j = 0; j < arg.length; j++) {
          result.push(arg[j]);
        }
        break;
      }
      result.push(arg);
    }

    return result;
  }
};