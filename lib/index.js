// jshint esnext: true

var compose = require('koa-compose');
var co = require('co');
var Crawler = require('x-ray-crawler');
var cheerio = require('cheerio');
var parse = require('./parse');
var absolutes = require('./absolutes');
var ao = require('./utils/ao');
var url = require('url');

var isUrl = function(x) {
  'use strict';
  return url.parse(x).protocol !== null;
};

var query = function(selector, $) {
  'use strict';

  if (undefined === $ || null === $) {
    throw new Error('Cannot query to empty scope');
  }
  return $.find ? $.find(selector) : $(selector);
};

var load = function(ctx, url) {
  'use strict';

  if (ctx === null || ctx === undefined) {
    return;
  }

  var $ = cheerio.load(ctx.body);
  $.context = ctx;
  // var $ = html.html ? html : cheerio.load(html);
  // if (url) $ = absolutes(url, $);

  return $;
};

module.exports = luwakProto();

function luwakProto(url, parentO) {
  'use strict';

  var luwakO = function LuwakO(url) {
    return luwakProto(url, luwakO);
  };

  luwakO.url = url || (parentO ? parentO.url : null);
  luwakO.selector = parentO ? parentO.selector : null;
  luwakO.paging = null;
  luwakO.numLimit = 10;
  Object.defineProperties(luwakO, {
    middlewares: {
      enumerable: false,
      writable: false,
      configurable: false,
      value: parentO ? parentO.middlewares.slice() : [],
    },
    filters: {
      enumerable: false,
      writable: false,
      configurable: false,
      value: parentO ? ao.mixin({}, parentO.filters) : {},
    },
  });

  Object.setPrototypeOf(luwakO, luwakProto);

  return luwakO;
}


luwakProto.prepare = function(name, filter) {
  'use strict';
  this.filters[name] = filter;
  return this;
};

luwakProto.use = function(middleware) {
  'use strict';
  this.middlewares.push(middleware);
  return this;
};

luwakProto.select = function(selector) {
  'use strict';
  this.selector = selector;
  return this;
};

luwakProto.paginate = function(selector, numLimit) {
  'use strict';

  this.paging = selector;
  this.numLimit = numLimit || 10;

  return this;
};

luwakProto.query = function(selector, $, isArray) {
  'use strict';

  return co(function *() {
    switch(typeof selector) {
      case 'string':
        var parsed = parse(selector);
        parsed.attribute = parsed.attribute || 'text';

        var results = [];
        var $els = query(parsed.selector, $);
        $els.each(function(i) {
          var $el = $els.eq(i);

          var result;
          switch(parsed.attribute) {
            case 'text':
              result = $el.text();
              break;
            case 'html':
              result = $el.html();
              break;
            default:
              result = $el.attr(parsed.attribute);
              break;
          }

          parsed.filters.forEach(function(filter) {
            if (this.filters[filter.name]) {
              var args = filter.args.slice();
              args.unshift(result);
              result = this.filters[filter.name].apply(null, args);
            }
          }.bind(this));

          results.push(result);
        }.bind(this));

        results = yield results;

        return isArray ? results : results[0];
      case 'object':
        if (Array.isArray(selector)) {
          return yield this.query(selector[0], $, true);
        } else {
          if (isArray) {
            var $scope = query(selector.$root, $);
            if ($scope.length === 0) return [];
            var arr = [];
            $scope.each(function(k, v) {
              arr.push(this.query(selector, $scope.eq(k)));
            }.bind(this));
            return yield arr;
          } else {
            var obj = {};
            for(var k in selector) {
              if (k === '$root') {
                continue;
              }
              var v = selector[k];
              obj[k] = this.query(v, $);
            }
            return yield obj;
          }
        }
        break;
      case 'function':
        if (typeof selector.start === 'function') {
          return yield selector.start($);
        } else {
          return yield co.wrap(selector).call(this, $);
        }
        // pass through to next
      default:
        throw new Error('Unimplemented');
    }
  }.bind(this));
};

luwakProto.crawl = function(url) {
  'use strict';

  return co(function *() {
    var fn = co.wrap(compose(this.middlewares));

    var crawler = new Crawler(function(ctx, done) {
      co(function *() {
        try {
          yield fn.call(ctx);
          done(null, ctx);
        } catch(err) {
          done(err);
        }
      });
    });

    return yield crawler(url);
  }.bind(this));
};

luwakProto.start = function($) {
  'use strict';

  return co(function *() {
    var seq = 0;
    var result = [];

    if (!this.paging) {
      this.numLimit = 1;
    }

    while (seq < this.numLimit || this.numLimit < 0) {

      // dont have valid url yet!, query first
      if (!isUrl(this.url)) {
        var theUrl = yield this.query(this.url, $);
        return yield this(theUrl).start();
      }

      var selector = this.selector;

      if (!$ || !arguments.length) {
        console.log('crawl>', this.url);
        var ctx = yield this.crawl(this.url);
        if (!ctx.body) {
          throw new Error('Empty body problem');
        }
        $ = load(ctx, this.url);
      }

      var pageResult = yield this.query(selector, $);
      result.push.apply(result, pageResult);

      seq++;
      if (this.paging) {
        var nextUrl = yield this.query(this.paging, $);
        if (!nextUrl) {
          break;
        } else if (isUrl(nextUrl)) {
          this.url = nextUrl;
        } else {
          var oldUrl = url.parse(this.url);
          oldUrl.pathname = '';
          oldUrl.search = '';
          this.url = url.format(oldUrl) + nextUrl;
        }
      }
    }
    return result;
  }.bind(this));
};