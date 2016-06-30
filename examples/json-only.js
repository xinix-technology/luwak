'use strict';

const luwak = require('../index');

try {
  var scraper = luwak({
    $from: 'http://sagara.id/p/portfolio',
    $select: [{
      '$root': '.porto',
      'url': 'a.image@href',
      'image': 'img@src',
      'name': 'a.small'
    }]
  })
  .fetch()
  .then((data) => {
    console.log(data);
  })
  .catch((e) => {
    console.error(e.stack);
  });
} catch(e) {
  console.error(e.stack);
}
