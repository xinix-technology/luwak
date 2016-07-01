'use strict';

const luwak = require('../index');
const cheerio = require('cheerio');

try {
  (new luwak.Scraper(`
<html>
  <body>
    <ul>
      <li class="product">
        <a href="#product">
          <div class="product-name">Foo</div>
          <div class="labels">
            <label>f</label>
            <label>o</label>
          </div>
        </a>
      </li>
      <li class="product">
        <a href="#product">
          <div class="product-name">Bar</div>
          <div class="labels">
            <label>b</label>
            <label>a</label>
            <label>r</label>
          </div>
        </a>
      </li>
    </ul>
  </body>
</html>
    `))
    .select([{
      '$root': 'li.product',
      'name': '.product-name',
      'labels': ['label'],
    }])
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
