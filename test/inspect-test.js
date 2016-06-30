'use strict';

const assert = require('assert');
const inspect = require('../inspect');

describe('inspect()', () => {
  it('return inspect object', () => {
    function Foo() {
      this.foo = 'foo';
      this.bar = 'bar';
    }

    let obj = new Foo();

    let inspected = inspect(obj, ['foo']);
    assert.equal(inspected.constructor.name, 'Foo');
    assert.deepEqual(inspected, {foo:'foo'});
  });
});