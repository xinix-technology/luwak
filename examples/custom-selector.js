'use strict';

const luwak = require('../index');
const cheerio = require('cheerio');

try {
  var scraper = new luwak.Scraper("http://sagara.id/p/portfolio");

  scraper
    .select(function ($root) {
      return $root.find('.porto a.image').map(function(i, el) {
        return cheerio(el).attr('href');
      }).get();
    })
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
