'use strict';

const luwak = require('../index');
const url = require('url');
const qs = require('querystring');
const sprintf = require("sprintf-js").sprintf;
const userAgent = require('../middlewares/user-agent.js');

try {
  let counter = 5;
  let rowIndex = 0;
  let s = luwak('https://www.bukalapak.com/c/buku?search%5Bkeywords%5D=buku&from=omnisearch&search_source=omnisearch_category')
    .use(userAgent('Googlebot/2.1 (+http://www.google.com/bot.html)'))
    .filter('stripBracket', function (value) {
      let matches = value.match(/\(([^)]+)\)/);
      if (matches) {
        return matches[1];
      }
      return value;
    })
    .select([{
      $root: '.basic-products .product-display',
      name: '.product-description h3 a',
      price: '.product-price .amount | int:10',
      img: '.product-media img@src',
      seller: {
        $root: '.product-seller',
        username: '.user__name a',
        city: '.user-city | trim',
      },
      rating: '.product__rating .rating | float',
      reviewCount: '.product__rating .review__aggregate | stripBracket | int',
      discount: '.product-discount-percentage-amount | int'
    }])
    .next('a.next_page@href')
    .limit(5)
    .fetch(function(row) {
      console.log(sprintf('%3d. %s', rowIndex++, row.name));
    })
    .then(data => {
      console.log('-------------- len', data);
    })
    .catch(err => console.error(err.stack));
} catch(e) {
  console.error(e.stack);
}