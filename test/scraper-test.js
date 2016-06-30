'use strict';

const assert = require('assert');
const Scraper = require('../scraper');

describe('Scraper', () => {
  describe('(constructor)', () => {
    it('accept no argument', () => {
      let scraper = new Scraper();
      assert(scraper.from === undefined);
    });

    it('accept argument as string', () => {
      let scraper = new Scraper('http://sagara.id/');
      assert.equal(scraper.from, 'http://sagara.id/');
    });

    it('accept argument as object', () => {
      let scraper = new Scraper({
        from: 'http://sagara.id',
        select: 'body'
      });
      assert.equal(scraper.from, 'http://sagara.id');
      assert.equal(scraper.selector, 'body');
    });

    it('not accept argument as other types', () => {
      assert.throws(() => new Scraper(33), /Scraper only accept string or object/);
      assert.throws(() => new Scraper(false), /Scraper only accept string or object/);
    });
  });

  describe('#select', () => {
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
});