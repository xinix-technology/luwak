var mkdirp = require('mkdirp');
var nfs = require('fs');
var promise = require('./promise');

var fs = {
  mkdir: promise.promisify(mkdirp),

  writeFile: promise.promisify(nfs.writeFile),

  readFile: promise.promisify(nfs.readFile),

  unlink: promise.promisify(nfs.unlink),
};

module.exports = fs;