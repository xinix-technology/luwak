'use strict';

module.exports = function(obj, exposes) {
  let inspected = {};
  exposes.forEach((k) => {
    inspected[k] = obj[k];
  });

  Object.defineProperty(inspected, 'constructor', {
    enumerable: false, value: obj.constructor,
  });

  return inspected;
};