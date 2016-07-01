'use strict';

module.exports = function(userAgents) {
  if (typeof userAgents === 'string') {
    userAgents = [userAgents];
  }

  return function (context, next) {
    var userAgent = userAgents.pop();
    userAgents.unshift(userAgent);

    context.header['User-Agent'] = userAgent;

    return next();
  };
};