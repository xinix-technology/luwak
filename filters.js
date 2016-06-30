'use strict';

class Filters {
  int(value, radix) {
    value = parseInt((value || '').toString(), radix || 10);
    if (isNaN(value)) {
      throw new Error('Value is not a number');
    }
    return value;
  }

  float(value) {
    value = parseFloat((value || '').toString());
    if (isNaN(value)) {
      throw new Error('Value is not a number');
    }
    return value;
  }

  trim(value) {
    return (value || '').toString().trim();
  }
}

module.exports = Filters;