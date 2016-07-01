'use strict';

const luwak = require('..');
const userAgent = require('../middlewares/user-agent');
const nightmare = require('../engines/nightmare');
const url = require('url');
const qs = require('querystring');
const sprintf = require("sprintf-js").sprintf;

try {
  let index = 1;
  luwak('https://www.tokopedia.com/search?st=product&q=sensor')
    .engine(nightmare())
    .filter('convertInt', function(value) {
      return parseInt(value.substr(3).replace('.', ''));
    })
    // .use(userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"))
    .select([{
      $root: '.product-card',
      name: '.detail__name',
      image: 'img@src',
      price: '.detail__price | convertInt'
    }]) // {"name":"X", "image":"x", "price", "d"}
    // .limit(567)
    .limit(3)
    .next((s) => {
      let q = qs.parse(url.parse(s.from).query);
      q.page = parseInt(q.page || '1', 10) + 1;
      return url.resolve(s.from, '?' + qs.stringify(q));
    })
    .fetch((row) => {
      console.log(row);
      // console.log(sprintf('%03d %s %s', index++, row.name, row.price));
    })
    // .fetch()
    .then(function(data) {
      console.log('--->', data);
    })
    .catch(e => console.error(e, e.stack));
} catch(e) {
  console.error(e, e.stack);
}