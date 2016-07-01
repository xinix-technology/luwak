'use strict';

const assert = require('assert');
const sinon = require('sinon');
const Scraper = require('../scraper');
const url = require('url');
const qs = require('querystring');

describe('Scraper', () => {
  describe('constructor', () => {
    it('accept no argument', () => {
      let scraper = new Scraper();
      assert(!scraper.from);
    });

    it('accept argument as string', () => {
      let scraper = new Scraper('http://sagara.id/');
      assert.equal(scraper.from, 'http://sagara.id/');

      scraper = new Scraper(`<div>some html</div>`);
      assert(!scraper.from);
      assert.equal(scraper.body, '<div>some html</div>');
    });

    it('accept argument as object', () => {
      let scraper = new Scraper({
        $from: 'http://sagara.id',
        $select: 'body'
      });
      assert.equal(scraper.from, 'http://sagara.id');
      assert.equal(scraper.selector, 'body');

      scraper = new Scraper({
        $body: '<div>some html</div>',
        $select: 'body'
      });
      assert(!scraper.from);
      assert.equal(scraper.body, '<div>some html</div>');
      assert.equal(scraper.selector, 'body');
    });

    it('not accept argument as other types', () => {
      assert.throws(() => new Scraper(33), /Scraper only accept string or object/);
    });
  });

  describe('#select()', () => {
    let scraper = new Scraper();

    it('accept argument as string', () => {
      scraper.select('foo');
    });

    it('accept argument as object', () => {
      scraper.select({});
    });

    it('return own instance', () => {
      assert.equal(scraper.select('foo'), scraper);
    });
  });

  describe('#filter()', () => {
    let scraper;

    beforeEach(() => {
      scraper = new Scraper();
    });

    it ('set new filter if 2nd parameter specified', () => {
      assert(!scraper.filters.foo);

      let foo = function() {};
      scraper.filter('foo', foo);

      assert.equal(scraper.filters.foo, foo);
    });

    it ('get filter if only specify one parameter', () => {
      assert(!scraper._cacheFilters.trim);
      let trim = scraper.filter('trim');
      assert(typeof trim === 'function');
      assert(scraper._cacheFilters.trim);
      trim = scraper.filter('trim');
    });

    it('throw error if filter not found', () => {
      assert.throws(() => {
        scraper.filter('notfound');
      });
    });

    it('generate wrapper function if filter has parameter', () => {
      let filter = scraper.filter('int:2');
      assert.notEqual(filter, scraper.filters.int);

      assert.equal(filter('10'), 2);
    });
  });

  describe('#compile()', () => {
    let scraper, $root;
    beforeEach(() => {
      scraper = new Scraper();
      $root = scraper.getRoot(`
        <div rel="zzz">
          <foo>Foo #1<bar> Bar #1 </bar></foo>
          <foo>Foo #2<bar> Bar #2 </bar></foo>
          <baz some-attr="attr-val"><span>foobarbaz</span></baz>
        </div>
      `);
    });

    it('return function', () => {
      assert(typeof scraper.compile('foo | trim') === 'function');
    });

    it('invoke recursively if parameter is array', () => {
      scraper.compile = sinon.spy(scraper.compile);

      scraper.compile(['foo']);

      sinon.assert.calledTwice(scraper.compile);
    });

    it('return specified parameter if parameter is function', () => {
      let fn = function() {};
      assert.equal(scraper.compile(fn), fn);
    });

    it('invoke compile for each field if parameter is object', () => {
      scraper.compile = sinon.spy(scraper.compile);
      scraper.compile({
        $root: 'div',
        foo: 'foo',
        bar: 'bar',
      });
      sinon.assert.calledWith(scraper.compile, 'foo');
      sinon.assert.calledWith(scraper.compile, 'bar');
    });

    it('throws error if parameter not function, string, object or array', () => {
      assert.throws(() => scraper.compile(10));
      assert.throws(() => scraper.compile(false));
    });

    describe('retval', () => {
      it('create and fetch new scraper instance if parameter is object which has $from or $body property', () => {
        let scraper = new Scraper('http://foo.com');
        let originalFetchFn = Scraper.prototype.fetch;

        let $root = {
          find() {}
        };

        let fn, spy;

        fn = scraper.compile({
          '$from': 'foo'
        });
        spy = Scraper.prototype.fetch = sinon.spy(Scraper.prototype.fetch);
        fn($root);
        sinon.assert.calledOnce(spy);
        Scraper.prototype.fetch = originalFetchFn;

        fn = scraper.compile({
          '$body': 'foo'
        });
        spy = Scraper.prototype.fetch = sinon.spy(Scraper.prototype.fetch);
        fn($root);
        sinon.assert.calledOnce(spy);
        Scraper.prototype.fetch = originalFetchFn;
      });

      it('return if parameter object', (done) => {
        let fn = scraper.compile({
          $root: 'div',
          foo: 'foo',
        });
        let fnArr = scraper.compile({
          $root: 'div',
          foo: ['bar | trim'],
        });
        let fnNoRoot = scraper.compile({
          foo: ['bar | trim'],
        });
        fn($root)
          .then(data => {
            assert.equal(typeof data.foo, 'string');
            return fnArr($root);
          })
          .then(data => {
            assert.equal(typeof data.foo, 'object');
            assert.deepEqual(data.foo, ['Bar #1', 'Bar #2']);
            return fnNoRoot($root);
          })
          .then(data => {
            assert.equal(typeof data.foo, 'object');
            assert.deepEqual(data.foo, ['Bar #1', 'Bar #2']);
            done();
          })
          .catch(e => done(e));
      });

      it('return if parameter is array', (done) => {
        let fn = scraper.compile([{
          $root: 'foo',
          bar: 'bar | trim',
        }]);
        fn($root)
          .then(data => {
            assert(Array.isArray(data));
            assert.deepEqual(data, [{bar: 'Bar #1'}, {bar: 'Bar #2'}]);
            done();
          })
          .catch(e => done(e));
      });

      it('return if parameter is string', (done) => {
        let fn = scraper.compile('baz | trim');
        let fn1 = scraper.compile('baz@html | trim');
        let fn2 = scraper.compile('baz@some-attr');

        let fna = scraper.compile(['foo | trim']);
        let fna1 = scraper.compile(['foo@html | trim']);
        let fna2 = scraper.compile(['baz@some-attr']);

        let fnx3 = scraper.compile('|trim');

        Promise.resolve(fn($root))
          .then(data => {
            assert.equal(data, 'foobarbaz');
            return fn1($root);
          })
          .then(data => {
            assert.equal(data, '<span>foobarbaz</span>');
            return fn2($root);
          })
          .then(data => {
            assert.equal(data, 'attr-val');
            return fna($root);
          })
          .then(data => {
            assert.deepEqual(data, [
              'Foo #1 Bar #1',
              'Foo #2 Bar #2'
            ]);
            return fna1($root);
          })
          .then(data => {
            assert.deepEqual(data, [
              'Foo #1<bar> Bar #1 </bar>',
              'Foo #2<bar> Bar #2 </bar>'
            ]);
            return fna2($root);
          })
          .then(data => {
            assert.deepEqual(data, ['attr-val']);
            return fnx3($root);
          })
          .then(data => {
            assert(data.startsWith('Foo'));
            assert(data.endsWith('foobarbaz'));
            done();
          })
          .catch(e => done(e));
      });
    });
  });

  describe('#inspect()', () => {
    it('return from and selector only', () => {
      let scraper = new Scraper({
        $from: 'http://foo',
        $select: 'bar'
      });
      assert.deepEqual(scraper.inspect(), { from: 'http://foo', selector: 'bar' });
    });
  });

  describe('#limit()', () => {
    let scraper = new Scraper();
    it('set page limit when parameter specified', () => {
      scraper.limit(33);
      assert.equal(scraper.pageLimit, 33);
    });

    it('return page limit when parameter not specified', () => {
      assert.equal(scraper.limit(), 33);
    });
  });

  describe('#next()', () => {
    let scraper;
    beforeEach(() => scraper = new Scraper('http://foo'));

    it('set nextFn when parameter specified', () => {
      scraper.next('foo');
      assert(typeof scraper.nextFn === 'function');
      let nextFn = function() {};
      scraper.next(nextFn);
      assert.equal(scraper.nextFn, nextFn);
    });

    it('return next url when parameter not specified', () => {
      scraper.body = '<a href="http://bar/">bar</a>';
      scraper.nextFn = function() {
        return 'foo';
      };
      scraper.limit(1);
      assert.equal(scraper.next(), 'foo');

      scraper.next('a@href');
      assert.equal(scraper.next(), 'http://bar/');
    });
  });

  describe('#fetch()', () => {
    it('returns promise', () => {
      let scraper = new Scraper('http://foo');
      assert(scraper.fetch() instanceof Promise);
    });

    it('throws error when reader function not specified on paginated scraping', () => {
      let scraper = new Scraper();
      scraper.isPaginated = () => true;
      assert.throws(() => scraper.fetch());
    });

    it('invoke engine if from specified', (done) => {
      let spy = sinon.spy(function(context) {
        return new Promise((resolve, reject) => {
          context.body = 'some data';
          resolve(context);
        });
      });
      let scraper = new Scraper('http://foo');
      scraper.engine(spy);
      scraper.fetch()
        .then((data) => {
          sinon.assert.calledOnce(spy);
          done();
        })
        .catch(err => done(err));
    });

    it('returns full body if no selector and not xml/html', (done) => {
      let scraper = new Scraper('http://foo');
      scraper.engine(function(context) {
        return new Promise((resolve, reject) => {
          context.body = {foo:'bar'};
          resolve(context);
        });
      });
      scraper.fetch()
        .then((data) => {
          assert.deepEqual(data, {foo:'bar'});
          done();
        })
        .catch(err => done(err));
    });

    it('returns with selector', (done) => {
      let scraper = new Scraper('http://foo');
      scraper.engine(function(context) {
        return new Promise((resolve, reject) => {
          context.body = `
            <foo>
              <bar>bar1</bar>
              <bar>bar2</bar>
            </foo>
          `;
          resolve(context);
        });
      });
      scraper.select('bar@html');
      scraper.fetch()
        .then(data => {
          assert.equal(data, 'bar1');
          done();
        })
        .catch(err => done(err));
    });

    it('returns without selector', (done) => {
      let scraper = new Scraper('http://foo');
      scraper.engine(function(context) {
        return new Promise((resolve, reject) => {
          context.body = `
            <foo>
              <bar>bar1</bar>
              <bar>bar2</bar>
            </foo>
          `;
          resolve(context);
        });
      });
      scraper.fetch()
        .then(data => {
          assert.equal(typeof data, 'string');
          done();
        })
        .catch(err => done(err));
    });

    it('invoke callback if callback parameter specified', (done) => {
      let spy = sinon.spy();
      let scraper = new Scraper('http://foo');
      scraper
        .engine(function(context) {
          return new Promise((resolve, reject) => {
            context.body = `
              <foo>
                <bar>bar1</bar>
                <bar>bar2</bar>
              </foo>
            `;
            resolve(context);
          });
        })
        .select(['bar'])
        .fetch(spy)
        .then(data => {
          sinon.assert.calledTwice(spy);
          done();
        })
        .catch(err => done(err));
    });

    it('run middlewares', (done) => {
      let scraper = new Scraper('http://foo');
      let flags = [false, false];
      scraper.use((context, next) => {
        flags[0] = true;
        return next();
      });
      scraper.use((context, next) => {
        flags[1] = true;
      });
      scraper
        .fetch()
        .then(() => {
          assert(flags);
          done();
        })
        .catch(e => done(e));
    });

    it('run with error on middleware throws', (done) => {
      let scraper = new Scraper('http://foo');
      scraper.use((context, next) => {
        throw new Error('something happened');
      });
      scraper
        .fetch()
        .then(() => {
          done(new Error('Error not throws'));
        })
        .catch(e => done());
    });

    it('fetches paginated scraping', (done) => {
      let bodies = [
        'body 1',
        'body 2',
        'body 3',
      ];
      let result = [];
      let scraper = new Scraper('http://foo?page=1');
      scraper.engine(function(context) {
        let page = qs.parse(url.parse(context.url).query).page;
        context.body = bodies[page-1];
        return Promise.resolve(context);
      });

      scraper
        .next((s) => {
          let page = parseInt(qs.parse(url.parse(s.from).query).page);
          if (bodies[page]) {
            return 'http://foo?page=' + (page + 1);
          }
        })
        .fetch(reader)
        .then(() => {
          assert.deepEqual(result, bodies);
          done();
        })
        .catch(err => done(err));

      function reader(row) {
        result.push(row);
      }
    });
  });
});