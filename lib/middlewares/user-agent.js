// jshint esnext: true

module.exports = function(userAgents) {
  'use strict';

  if (typeof userAgents === 'string') {
    userAgents = [userAgents];
  }

  return function *(next) {
    var userAgent = userAgents.pop();
    userAgents.unshift(userAgent);

    this.header['User-Agent'] = userAgent;

    yield next;
  };
};