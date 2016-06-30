'use strict';

const assert = require('assert');
const Filters = require('../filters');

describe('Filters', () => {
  let filters = new Filters();

  describe('#int()', () => {
    it('parse to int', () => {
      assert.equal(filters.int('100'), 100);
      assert.equal(filters.int('100.5'), 100);
      assert.equal(filters.int('0100'), 100);
    });

    it('does not parse empty', () => {
      assert.throws(() => {
        filters.int();
      }, Error);

      assert.throws(() => {
        filters.int('');
      }, Error);
    });
  });

  describe('#float()', () => {
    it('parse to float', () => {
      assert.equal(filters.float('100'), 100);
      assert.equal(filters.float('100.5'), 100.5);
      assert.equal(filters.float('0100'), 100);
    });

    it('does not parse empty', () => {
      assert.throws(() => {
        filters.float();
      }, Error);

      assert.throws(() => {
        filters.float('');
      }, Error);
    });
  });

  describe('#trim', () => {
    it('trim spaces', () => {
      assert.equal(filters.trim('   hello   '), 'hello');
      assert.equal(filters.trim(), '');
    });
  });
});