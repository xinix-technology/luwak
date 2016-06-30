'use strict';

const luwak = require('../index');

try {
  var scraper = new luwak.Scraper("http://sagara.id/p/portfolio");

  scraper
    .select([{
      '$root': '.porto',
      'url': 'a.image@href',
      'image': 'img@src',
      'name': 'a.small'
    }])
    .fetch()
    .then((data) => {
      console.log(data);
    })
    .catch((e) => {
      console.error(e.stack);
    });

  console.log(scraper);
} catch(e) {
  console.error(e.stack);
}
