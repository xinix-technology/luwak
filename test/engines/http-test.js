'use strict';

const assert = require('assert');
const http = require('../../engines/http');
const h = require('http');

describe('http()', () => {
  let engine = http();

  it('return function', () => {
    assert(typeof engine === 'function');
  });

  describe('retval', () => {
    let server = h.Server((req, res) => {
      // console.log(req.method, req.url);
      switch(req.url) {
        case '/500':
          res.writeHead(500);
          break;
        case '/redirect':
          res.writeHeader(302, {
            Location: '/redirected'
          });
          break;
        case '/json':
          res.write('{}');
          break;
        default:
          res.write('foo');
      }
      return res.end();
    });
    server.listen();

    it('return Promise', () => {
      let context = {
        url: 'http://localhost:' + server.address().port,
        headers: {},
        set() {}
      };
      assert(engine(context) instanceof Promise);
    });

    it('set headers and body', (done) => {
      let headerSet = false;

      let context = {
        url: 'http://localhost:' + server.address().port,
        headers: {},
        set() {
          headerSet = true;
        }
      };

      engine(context)
        .then((ctx) => {
          assert.equal(ctx, context);
          assert.equal(ctx.body, 'foo');
          assert(headerSet);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('follow redirection', (done) => {
      let context = {
        url: 'http://localhost:' + server.address().port + '/redirect',
        headers: {},
        set() {}
      };

      engine(context)
        .then((ctx) => {
          assert.equal(ctx.url, 'http://localhost:' + server.address().port + '/redirected');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('set body as json on content-type: application/json', (done) => {
      let context = {
        url: 'http://localhost:' + server.address().port + '/json',
        type: 'application/json',
        headers: {},
        set() {}
      };

      engine(context)
        .then((ctx) => {
          assert(typeof ctx.body === 'object');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('set status on http error', (done) => {
      let context = {
        url: 'http://localhost:' + server.address().port + '/500',
        headers: {},
        set() {}
      };

      engine(context)
        .then((ctx) => {
          assert.equal(ctx.status, 500);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});