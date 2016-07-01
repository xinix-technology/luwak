'use strict';

const Nightmare = require('nightmare');

module.exports = function(options) {
  // console.log('using engine: http');
  return function(context) {
    let nightmare = new Nightmare();

    return nightmare
      .goto(context.url)
      .then(res => {
        context.status = res.code;
        context.set(res.headers);
        context.url = res.url;

        /* istanbul ignore else */
        if (nightmare.evaluate) {
          return nightmare.evaluate(evaluateFn).end();
        } else {
          return nightmare.end();
        }
      })
      .then(body => {
        context.body = body;
        return context;
      })
      .catch(e => {
        let err = new Error(e.message);
        err.original = e;
        throw err;
      });
  };
};

/* istanbul ignore next */
function evaluateFn() {
  return document.documentElement.outerHTML; // jshint ignore:line
}