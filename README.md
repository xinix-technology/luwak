# Luwak

Luwak (mongoose) is animal that eat coffee beans and poop beans out as best coffee in the world.

The philosophy is vast internet data already rich in web pages kind, somehow for our application we need clean data. With luwak we can extract and scrape data from web pages.

## How to use

Install using npm,

```sh
npm i luwak
```

Then write the code,

```js
const { Scraper, release, source } = require('luwak');

(async () => {
    const scraper = new Scraper('http://example.net/some-list.html');

    try {
        const result = scraper.fetch([{
            '$root': '.pd',
            'title': '.m > a',
            'url': '.m > a@href',
            'websiteTitle': source('.m > a@href', 'title'),
        }])

        console.info(result);
    } catch (err) {
        console.error(err.stack)
    } finally {
        await scraper.close();
        await release();
    }

})();
```
