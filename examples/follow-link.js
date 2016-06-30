'use strict';

const luwak = require('../index');

try {
  var scraper = new luwak.Scraper("https://www.bukalapak.com/products?utf8=%E2%9C%93&search%5Bkeywords%5D=ikat+pinggang");

  scraper.filter('hitung', function(value) {
    return value.split(' ').length;
  });

  scraper
    .select([{
      '$root': '.product-display',
      'name': '.product-description h3 a',
      'countName': '.product-description h3 a | hitung',
      'price': {
        '$from': '.product-description h3 a@href',
        '$select': '.product-detailed-price .amount | float'
      }
    }])
    .fetch()
    .then((data) => {
      console.log('>>>', data);
    })
    .catch((e) => {
      console.error(e.stack);
    });
} catch(e) {
  console.error(e.stack);
}
