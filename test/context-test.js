'use strict';

const assert = require('assert');
const Context = require('../context');

describe('Context', () => {
  describe('constructor', () => {
    it('accept argument url as string', () => {
      let context = new Context('http://sagara.id');
      assert.equal(context.url, 'http://sagara.id');
    });
  });
});