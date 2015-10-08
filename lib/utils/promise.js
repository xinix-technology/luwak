var ao = require('./ao');

module.exports = {
  promisify: function(fn) {
    'use strict';

    return function() {
      var args = ao.flatten(arguments);

      return new Promise(function(resolve, reject) {
        try {
          args.push(function(err, result) {
            if (err) {
              reject(err);
            }

            resolve(result);
          });

          fn.apply(null, args);
        } catch(err) {
          return reject(err);
        }
      });
    };
  }
};