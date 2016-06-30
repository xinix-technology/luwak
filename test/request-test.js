'use strict';

const assert = require('assert');
const Request = require('../request');

describe('Request', () => {
  describe('constructor', () => {
    it('accept context as argument', () => {
      let context = { req: {} };
      let req = new Request(context);
      assert.equal(req.context, context);
      assert.equal(req.req, context.req);
    });
  });

  describe('get header(s)', () => {
    it('get header(s) from original req', () => {
      let context = {
        req: {
          headers: {
            'x-foo': 'bar'
          }
        }
      };
      let req = new Request(context);
      assert.deepEqual(req.header, {'x-foo': 'bar'});
      assert.deepEqual(req.headers, {'x-foo': 'bar'});
    });
  });

  describe('get and set method', () => {
    it('get and set method from/to original req', () => {
      let context = {
        req: {
          method: 'GET',
        }
      };
      let req = new Request(context);
      assert.equal(req.method, 'GET');

      req.method = 'POST';
      assert.equal(req.method, 'POST');
      assert.equal(context.req.method, 'POST');
    });
  });

  describe('get type', () => {
    it('get type from original req', () => {
      let context = {
        req: {
          headers: {
            'content-type': 'application/json; utf8'
          }
        }
      };
      let req = new Request(context);
      assert.equal(req.type, 'application/json');

      context = {
        req: {
          headers: {
          }
        }
      };
      req = new Request(context);
      assert.equal(req.type, '');
    });
  });

  describe('#get()', () => {
    it('get from original req headers', () => {
      let context = {
        req: {
          headers: {
            'referer': 'http://sagara.id'
          }
        }
      };
      let req = new Request(context);
      assert.equal(req.get('referer'), 'http://sagara.id');

      context = {
        req: {
          headers: {
          }
        }
      };
      req = new Request(context);
      assert.equal(req.get('referer'), '');
    });
  });
});