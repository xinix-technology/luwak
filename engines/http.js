'use strict';

const superagent = require('superagent');

module.exports = function(options) {
  var agent = superagent.agent(options || {});

  // console.log('using engine: http');
  return function(context) {
    return agent
      .get(context.url)
      .set(context.headers)
      .then((res) => {
        context.status = res.status;
        context.set(res.headers);
        context.body = 'application/json' == context.type ? res.body : res.text;

        // update the URL if there were redirects
        context.url = res.redirects.length ? res.redirects.pop() : context.url;

        return context;
      })
      .catch((e) => {
        // with new superagent i dont think we need this anymore since error will be automatically http error
        // if (e && !e.status) {
        //   // might not be here anyway!
        //   console.error(e.stack);
        //   context.status = 500;
        //   return context;
        // } else {
          context.status = e.status;
          return context;
        // }
      });
  };
};