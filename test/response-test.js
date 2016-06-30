'use strict';

const assert = require('assert');
const Response = require('../response');

describe('Response', () => {
  describe('constructor', () => {
    it('accept context as argument', () => {
      let context = { res: {} };
      let res = new Response(context);
      assert.equal(res.context, context);
      assert.equal(res.res, context.res);
    });
  });

  describe('get header(s)', () => {
    it('get header(s) from original res', () => {
      let context = {
        res: {
          _headers: {
            'x-foo': 'bar'
          }
        }
      };
      let res = new Response(context);
      assert.deepEqual(res.header, {'x-foo': 'bar'});
      assert.deepEqual(res.headers, {'x-foo': 'bar'});

      context = { res: {} };
      res = new Response(context);
      assert.deepEqual(res.header, {});
      assert.deepEqual(res.headers, {});
    });
  });

  describe('get and set status', () => {
    it('get and set status from/to original res', () => {
      let context = {
        res: {
          statusCode: 404,
        }
      };
      let res = new Response(context);
      assert.equal(res.status, 404);

      res.status = 200;
      assert.equal(res.status, 200);
      assert.equal(context.res.statusCode, 200);
    });
  });

  describe('get and set body', () => {
    it('get and set body from/to original res', () => {
      let context = {
        res: {

        }
      };
      let res = new Response(context);
      assert.equal(res.body, undefined);

      res.body = 'foo';
      assert.equal(res._body, 'foo');
      assert.equal(res.body, 'foo');
      assert.equal(res.status, 200);

      context = {
        res: {
        }
      };
      res = new Response(context);
      assert.equal(res.body, undefined);

      res.body = '<div>foo</div>';
      assert.equal(res._body, '<div>foo</div>');
      assert.equal(res.body, '<div>foo</div>');
      assert.equal(res.status, 200);

      context = {
        res: {
          statusCode: 401,
          headersSent: true,
        }
      };
      res = new Response(context);
      assert.equal(res.body, undefined);

      res.body = 'foo';
      assert.equal(res._body, 'foo');
      assert.equal(res.body, 'foo');
      assert.equal(res.status, 401);

      context = {
        res: {
          removeHeader() {}
        }
      };
      res = new Response(context);
      assert.equal(res.body, undefined);

      res.body = {};
      assert.deepEqual(res._body, {});
      assert.deepEqual(res.body, {});
      assert.deepEqual(res.status, 200);
    });
  });

  describe('#get()', () => {
    it('get from original res headers', () => {
      let context = {
        res: {
          _headers: {
            'content-type': 'application/pdf'
          }
        }
      };
      let res = new Response(context);
      assert.equal(res.get('content-type'), 'application/pdf');

      context = {
        res: {
          _headers: {
          }
        }
      };
      res = new Response(context);
      assert.equal(res.get('content-type'), '');
    });
  });

  describe('#set()', () => {
    it('set to original res headers', () => {
      let context = {
        res: {
          setHeader(key, value) {
            this._headers[key] = value;
          },

          _headers: {
          }
        }
      };
      let res = new Response(context);
      res.set({
        'content-type': 'application/pdf',
        'x-foo': [1,2,3],
      });
      assert.equal(res.get('content-type'), 'application/pdf');
      assert.deepEqual(res.get('x-foo'), ['1','2','3']);
    });
  });
});