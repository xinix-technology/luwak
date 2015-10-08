// jshint esnext: true

var superagent = require('superagent');

module.exports = function(options) {
  'use strict';

  options = options || {};

  var agent = superagent.agent(options);

  return function *(next) {

    var res = yield agent
      .get(this.url)
      .set(this.headers);


      this.status = res.status;
      this.set(res.headers);

      this.body = 'application/json' == this.type ? res.body : res.text;

      // update the URL if there were redirects
      this.url = res.redirects.length ? res.redirects.pop() : this.url;
  };
};