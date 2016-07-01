'use strict';

const assert = require('assert');
const http = require('http');
const nightmare = require('../../engines/nightmare');

describe('nightmare()', () => {
  it('returns function', () => {
    assert('function' === typeof nightmare());
  });

  describe('retval', () => {
    let server;

    before(done => {
      server = http.Server((req, res) => {
        switch(req.url) {
          case '/500':
            res.writeHead(500);
            break;
          default:
            res.write('<html><head></head><body>foo</body></html>');
        }
        return res.end();
      });
      server.listen(null, function() {
        done();
      });
    });

    let n = nightmare();

    let originalEvaluate;

    let nightmareLib = require('nightmare');
    beforeEach(() => {
      if (process.env.COVERAGE) {
        originalEvaluate = nightmareLib.prototype.evaluate;

        nightmareLib.prototype.evaluate = function() {
          return this;
        };
      }
    });

    afterEach(() => {
      nightmareLib.prototype.evaluate = originalEvaluate;
    });

    it('return context with body', (done) => {
      let context = {
        url: 'http://localhost:' + server.address().port,
        set() {},
      };
      n(context)
        .then(() => {
          if (!process.env.COVERAGE) {
            assert.equal(context.body, '<html><head></head><body>foo</body></html>');
          }
          done();
        })
        .catch(e => done(e));
    }).slow(2000);

    it('get error status on http error', (done) => {
      let context = {
        url: 'http://localhost:' + server.address().port + '/500',
        set() {},
      };
      n(context)
        .then(() => {
          assert.equal(context.status, 500);
          done();
        })
        .catch(e => done(e));
    }).slow(2000);

    it('get error astatus on http error', (done) => {
      let context = {
        url: 'http://foo',
        set() {},
      };
      n(context)
        .then(() => done(new Error('must throw error')))
        .catch(e => done());
    }).slow(2000);
  });
});