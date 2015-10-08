var url = require('url');
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');

var getCachePath = function(resourceUrl, cacheDir) {
  'use strict';

  var parsed = url.parse(resourceUrl);

  return path.join(cacheDir, parsed.hostname + (parsed.port ? '.' + parsed.port : '') + parsed.path);
  // return path.join(cacheDir, resourceUrl.replace(/(:\/\/|:)/g, '.'));
};

var prepare = function(options) {
  'use strict';

  var defaultOptions = {
    cacheDir: './cache',
  };

  options = options || {};
  for(var i in defaultOptions) {
    if (typeof options[i] === 'undefined') {
      options[i] = defaultOptions[i];
    }
  }

  return options;
};

var writeFile = function(filename, body) {
  'use strict';

  return new Promise(function(resolve, reject) {
    // console.log('writing', filename);
    fs.writeFile(filename, body, function(err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

var readFile = function(filename) {
  'use strict';

  return new Promise(function(resolve, reject) {
    fs.readFile(filename, function(err, body) {
      if (err) {
        return reject(err);
      }
      resolve(body);
    });
  });
};

var write = function(response, cachePath) {
  'use strict';
  return new Promise(function(resolve, reject) {
    mkdirp(cachePath, function(err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  })
  .then(function() {
    return writeFile(path.join(cachePath, '_body'), response.body);
  })
  .then(function() {
    return writeFile(path.join(cachePath, '_meta'), JSON.stringify({
      fetchedTime: new Date(),
      status: response.status,
      header: response.header
    }, null, 2));
  });
};

var read = function(cachePath) {
  'use strict';

  var response = {};
  return readFile(path.join(cachePath, '_meta'))
    .then(function(data) {
      var meta = JSON.parse(data);
      response.header = meta.header;

      return readFile(path.join(cachePath, '_body'));
    })
    .then(function(data) {
      response.body = data;

      return response;
    });
};

module.exports = function(options) {
  'use strict';

  options = prepare(options);

  var driver = options.driver || require('x-ray-crawler/lib/http-driver')();

  // var phantom = require('x-ray-phantom')({
  //   port: '0' // avoid EADDRINUSE
  // });

  return function(ctx, done) {
    var cachePath = getCachePath(ctx.url, options.cacheDir);
    read(cachePath)
      .then(function(response) {
        ctx.response = response;
        done(null, ctx);
      }, function() {
        driver(ctx, function(err, ctx) {
          if (!err) {
            write(ctx.response, cachePath)
              .then(function() {
                done(null, ctx);
              });
          }
        });
      });
  };
};