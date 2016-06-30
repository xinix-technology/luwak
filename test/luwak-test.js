'use strict';

const assert = require('assert');
const luwak = require('../index');

describe('luwak', () => {
  it('return Scraper instance', () => {
    let scraper = luwak();
    assert(scraper);
    assert(scraper instanceof luwak.Scraper);
  });
});