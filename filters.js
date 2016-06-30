'use strict';

class Filters {
  int(value, radix) {
    return parseInt((value || '').toString(), radix || 10);
  }

  float(value) {
    return parseFloat((value || '').toString());
  }

  trim(value) {
    return (value || '').toString().trim();
  }
}

module.exports = Filters;