# luwak

Luwak is animal that eat coffee beans and poop beans out as best coffee in the world.

The philosophy is vast internet data already rich in web pages kind, somehow for our application we need clean data. With luwak we can extract and scrape data from web pages.

Snippet how to use.
```
const luwak = require('../lib/index');
const co = require('co');
const url = require('url');

const destinationUrl = 'http://example.net/some-list.html';

luwak
  .prepare('urlParse', function(urlString) {
    return url.parse(urlString);
  })
  .use(require('luwak/lib/middlewares/user-agent')('Googlebot/2.1 (+http://www.google.com/bot.html)'))
  .use(require('luwak/lib/middlewares/http-engine')());

co(function *() {
  try {
    var data = yield luwak(destinationUrl)
      .select([
        {
          '$root': '.pd',
          'title': '.m > a',
          'url': '.m > a@href',
          'websiteTitle': luwak('.m > a@href').select('title'),
        },
        // 'a@href'
      ])
      .paginate('a[rel=next]@href', 10)
      .start();
    console.log(data);
  } catch(e) {
    console.error('<E>', e.stack);
  }
});
```