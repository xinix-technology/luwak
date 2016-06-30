'use strict';

/**
 * requires
 */
const assert = require('assert');
const http = require('./engines/http');
const inspect = require('./inspect');
const Context = require('./context');
const cheerio = require('cheerio');
const url = require('url');
const Filters = require('./filters');

/**
 * Scraper class
 */
class Scraper {
  /**
   * Construct new scrapper
   * @param  {string|object} options optional, if string as from if object populate attributes
   */
  constructor(options) {
    this.filters = new Filters();

    this.cacheFilters = {};

    if ('undefined' !== typeof options) {
      switch(typeof options) {
        case 'string':
          if (this.isURL(options)) {
            this.from = options;
          } else {
            this.body = options;
          }
          break;
        case 'object':
          if (options.$from) this.from = options.$from;
          else if (options.$body) this.body = options.$body;

          if (options.$select) this.select(options.$select);
          break;
        default:
          throw new Error('Scraper only accept string or object');
      }
    }
  }

  isURL(str) {
    return null !== url.parse(str).protocol;
  }

  /**
   * Add or modify selector, returning own instance so it can be chained
   * @param  {string|object} selector must be string or object
   * @return {Scraper}
   */
  select(selector) {
    this.selector = selector;
    this.compiled = this.compile(selector);
    return this;
  }

  filter(name, fn) {
    if (!fn) {
      if (this.cacheFilters[name]) {
        return this.cacheFilters[name];
      }

      let rawArgs = name.split(':');
      let rawName = rawArgs.shift();
      let raw = this.filters[rawName];

      if (!raw) {
        throw new Error('Unknown filter ' + rawName);
      }

      let filter = raw;
      if (0 < rawArgs.length) {
        filter = function(value) {
          let args = [value];
          args.push.apply(args, rawArgs);
          return raw.apply(null, args);
        };
      }
      this.cacheFilters[name] = filter;
      return filter;
    }

    this.filters[name] = fn;
    return this;
  }

  /**
   * Compile selector into function selector
   * @param  {mixed} selector
   * @return {function}
   */
  compile(selector, multi) {
    multi = multi || false;
    if (!multi && Array.isArray(selector)) {
      return this.compile(selector[0], true);
    }

    let originSelf = this;
    let originFrom = this.from;

    switch(typeof selector) {
      case 'function':
        return selector;
      case 'object':
        if (selector.$from || selector.$body) {
          let _fromFn;
          if (selector.$from) {
            _fromFn = this.compile(selector.$from);
          }
          return function($root) {
            let options = clone(selector);
            if (_fromFn) {
              options.$from = url.resolve(originFrom, _fromFn($root));
            } else {
              options.$body = selector.$body;
            }
            let childScraper = new Scraper(options);
            childScraper.engine(originSelf.engine());
            return childScraper.fetch();
          };
        }
        let fields = [];
        for(let i in selector) {
          if ('$root' === i) continue;
          fields.push([i, this.compile(selector[i])]);
        }

        let _mapObject = function(i, el) {
          return Promise.all(fields.map(field => {
            return field[1](cheerio(el));
          }))
          .then(result => {
            return fields.reduce((obj, field, k) => {
              obj[field[0]] = result[k];
              return obj;
            }, {});
          });
        }.bind(this);

        return function($root) {
          $root = selector.$root ? $root.find(selector.$root) : $root;
          if (multi) {
            return Promise.all(
              $root.map(_mapObject).get()
            );
          } else {
            return _mapObject(0, $root);
          }
        };
      case 'string':
        let rawFilters = selector.split('|').map(s => s.trim());
        let sel = rawFilters.shift().split('@').map(s => s.trim());
        let objectSel = sel[0] || '';
        let fieldSel = sel[1] || 'text';
        let filters = rawFilters.map(function (filter) {
          return this.filter(filter);
        }.bind(this));

        let _mapScalar = function(i, el) {
          let $el = cheerio(el);
          let value;
          switch(fieldSel) {
            case 'html':
            case 'text':
              value = $el[fieldSel]();
              break;
            default:
              value = $el.attr(fieldSel);
              break;
          }

          value = filters.reduce((value, filter) => {
            return Promise.resolve(value).then(v => filter(value));
          }, value);

          // TODO filters
          return value;
        };

        return function($root) {
          $root = objectSel ? $root.find(objectSel) : $root;
          if (multi) {
            return Promise.all($root.map(_mapScalar).get());
          } else {
            return _mapScalar(0, $root);
          }
        };
      default:
        throw new Error('Selector must be string, function or object');
    }
  }

  /**
   * Fetch each row if parameter is function, or return promise if no parameter specified
   * @param  {function} fn optional fetcher function
   * @return {Promise}
   */
  fetch(fn) {
    // let data = [];
    // let eachCallback = function(row) {
    //   data.push(row);
    //   if (typeof fn === 'function') {
    //     fn(row);
    //   }
    // };

    let _getValue = function() {
      let $root = this.getRoot(this.body);
      let valuePromised;
      if (this.compiled) {
        valuePromised = this.compiled($root);
      } else if ($root) {
        valuePromised = $root.text();
      } else {
        valuePromised = this.body;
      }

      valuePromised = Promise.resolve(valuePromised);

      if (fn) {
        valuePromised.then(data => {
          if (data !== null && data !== undefined) {
            (Array.isArray(data) ? data : [data]).forEach(row => fn(row));
          }
          return data;
        });
      }
      return valuePromised;
    }.bind(this);

    if (this.from) {
      let engine = this.engine();
      let context = new Context(this.from);
      return engine(context)
        .then(function() {
          this.body = context.body;
          return _getValue();
        }.bind(this));
    } else {
      return _getValue();
    }

  }

  /**
   * Get root from body
   * @param  {mixed} body
   * @return {mixed}
   */
  getRoot(body) {
    if ('string' === typeof body) {
      return cheerio(cheerio.load(body)._root);
    }
  }

  /**
   * Get or set engine
   * @param  {function} fn if specified set engine otherwise get
   * @return {function|Scraper} if parameter specified return function otherwise return own instance of Scraper
   */
  engine(fn) {
    if (0 === arguments.length) {
      if (!this.engineFn) {
        this.engineFn = http();
      }
      return this.engineFn;
    }
    this.engineFn = fn;
    return this;
  }

  /**
   * Overrride inspect for easy debugging
   * @return {object}
   */
  inspect() {
    return inspect(this, ['from', 'selector']);
  }
}

function clone(obj) {
  let cloned = {};
  for(let i in obj) {
    cloned[i] = obj[i];
  }
  return cloned;
}

/**
 * export Scraper
 * @type {Scraper}
 */
module.exports = Scraper;