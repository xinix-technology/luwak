# Luwak

Luwak is animal that eat coffee beans and poop beans out as best coffee in the world.

The philosophy is vast internet data already rich in web pages kind, somehow for our application we need clean data. With luwak we can extract and scrape data from web pages.

## How to use

Install using npm,

```
npm i luwak
```

Then write the code,

```
const luwak = require('luwak');

luwak('http://example.net/some-list.html')
    .select([{
        '$root': '.pd',
        'title': '.m > a',
        'url': '.m > a@href',
        'websiteTitle': {
            '$from': '.m > a@href'
            '$select': 'title',
        },
    }]) // or .select(['a@href'])
    fetch()
    .then(data => console.log(data))
    .catch(err => console.error(err.stack));
```

## API

TBD

### Scraper#select()

Specify selector to define data result structure

see Selectors

### Scraper#engine()

TBD

## Selectors

Selector can be specified in four ways:

### as string

CSS-based selectors and specification to acquire data from attributes, innerText, or innerHTML with `@` (default to innerText).

### as select object

Define structure that build result data as composite of string-based selectors.

As opposed to scrape object, select object does not have `$from` or `$body` property.

### as scrape object

Define structure that build child scraping unit and embed the result data.

As opposed to select object, scrape object have `$from` or `$body` property. Select object may defined in `$select` property.

### as array

Tell scraper to fetch the selector wrapped by array as multi-valued result data.

## Built-in Filters

There are several built-in filters to be used right away.

### int(radix)

Parse and prepare to int

### float()

Parse and prepare to float

### trim()

Trim empty characters out
