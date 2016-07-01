'use strict';

const assert = require('assert');
const Filters = require('../filters');

describe('Filters', () => {
  let filters = new Filters();

  describe('#substr()', () => {
    it('return substring of value', () => {
      assert.equal(filters.substr('foo bar', 4), 'bar');
      assert.equal(filters.substr('foo bar', 2, 3), 'o b');
      assert.equal(filters.substr(null, 1), '');
    });
  });

  describe('#int()', () => {
    it('parse to int', () => {
      assert.equal(filters.int(), 0);
      assert.equal(filters.int('100'), 100);
      assert.equal(filters.int('100.5'), 100);
      assert.equal(filters.int('0100'), 100);
    });

    it('throws error on NaN', () => {
      assert.throws(() => filters.int('foo'));
    });
  });

  describe('#float()', () => {
    it('parse to float', () => {
      assert.equal(filters.float(), 0);
      assert.equal(filters.float('100'), 100);
      assert.equal(filters.float('100.5'), 100.5);
      assert.equal(filters.float('0100'), 100);
    });

    it('throws error on NaN', () => {
      assert.throws(() => filters.float('foo'));
    });
  });

  describe('#trim', () => {
    it('trim spaces', () => {
      assert.equal(filters.trim('   hello   '), 'hello');
      assert.equal(filters.trim(), '');
    });

  });

  describe('#default', () => {
    it('return default value', () => {
      assert.equal(filters.default(null, 'foo'), 'foo');
      assert.equal(filters.default('', 'foo'), 'foo');
      assert.equal(filters.default(undefined, 'foo'), 'foo');

      assert.equal(filters.default('bar', 'foo'), 'bar');
    });
  });
});