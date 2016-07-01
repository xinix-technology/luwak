'use strict';

class Filters {
  substr(value, start, length) {
    return (value || '').toString().substr(start, length);
  }

  default(value, defValue) {
    return ('' === value || null === value || undefined === value) ? defValue : value;
  }

  int(value, radix) {
    let oldValue = value;
    value = parseInt((value || '0').toString(), radix || 10);
    if (isNaN(value)) {
      throw new Error('Value is not a number');
    }
    return value;
  }

  float(value) {
    value = parseFloat((value || '0').toString());
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