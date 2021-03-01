/* eslint-disable mocha/no-hooks-for-single-case */
const assert = require('assert');
const { Scraper, source, release } = require('..');

describe('Scraper', () => {
  after(async () => {
    await release();
  });

  it('scrape default', async () => {
    const src = `
      <html>
      <head>
        <title>title</title>
      </head>
      <body><h1>Hello!</h1><p>This is content</p></body>
      </html>
    `;

    const scraper = new Scraper(src);
    const fetched = await scraper.fetch();
    assert.strictEqual(fetched.trim(), 'Hello!This is content');
  });

  it('scrape scalar', async () => {
    const src = `
      <html>
        <head>
          <title>foo</title>
        </head>
        <body>
          <h1>header</h1>
          <p>p1</p>
          <p>p2</p>
        </body>
      </html>
    `;
    const scraper = new Scraper(src);
    assert.strictEqual(await scraper.fetch('title'), 'foo');
    assert.strictEqual(await scraper.fetch('h1'), 'header');
    assert.strictEqual(await scraper.fetch('p'), 'p1');
  });

  it('scrape with filter', async () => {
    const src = `
      Price <span>1000</span>
    `;

    const filters = {
      number: v => parseInt(v, 10),
    };

    const scraper = new Scraper(src, '', { filters });
    assert.strictEqual(await scraper.fetch('span | number'), 1000);
  });

  it('scrape function', async () => {
    const src = `
      <html>
        <head>
          <title>foo</title>
        </head>
        <body>
          <h1>header</h1>
        </body>
      </html>
    `;

    const scraper = new Scraper(src);
    assert.strictEqual(await scraper.fetch(() => document.querySelector('title').textContent), 'foo');
  });

  it('scrape array', async () => {
    const src = `
      <h1>header</h1>

      <p>p1</p>
      <p>p2</p>
      <p>p3</p>
    `;

    const scraper = new Scraper(src);
    assert.deepStrictEqual(await scraper.fetch(['p']), ['p1', 'p2', 'p3']);
  });

  it('scrape object', async () => {
    const src = `
      <div class="product">
        <h1>header</h1>

        <p>p1</p>
        <p>p2</p>
        <p>p3</p>
      </div>
    `;

    const scraper = new Scraper(src);
    assert.deepStrictEqual(await scraper.fetch({ name: 'h1', ps: ['p'] }), { name: 'header', ps: ['p1', 'p2', 'p3'] });
  });

  it('scrape array of object', async () => {
    const src = `
      <div class="product">
        <h1>product1</h1>
      </div>
      <div class="product">
        <h1>product2</h1>
      </div>
      <div class="product">
        <h1>product3</h1>
      </div>
    `;

    const scraper = new Scraper(src);
    assert.deepStrictEqual(await scraper.fetch([{ $root: '.product', name: 'h1' }]), [
      { name: 'product1' },
      { name: 'product2' },
      { name: 'product3' },
    ]);
  });

  it('scrape nested query', async () => {
    const src = `
      <div class="employee">
        <h1>John</h1>
        <div class="child">
          <h2>Susan</h2>
          <p>Age <span>10</span></p>
        </div>
        <div class="child">
          <h2>Ali</h2>
          <p>Age <span>8</span></p>
        </div>
      </div>
      <div class="employee">
        <h1>Jane</h1>
        <div class="child">
          <h2>Jack</h2>
          <p>Age <span>21</span></p>
        </div>
        <div class="child">
          <h2>Bob</h2>
          <p>Age <span>15</span></p>
        </div>
      </div>
    `;

    const scraper = new Scraper(src);
    const q = [{
      $root: '.employee',
      name: 'h1',
      children: [{
        $root: '.child',
        name: 'h2',
        age: 'span',
      }],
    }];
    assert.deepStrictEqual(await scraper.fetch(q), [
      {
        name: 'John',
        children: [
          { name: 'Susan', age: '10' },
          { name: 'Ali', age: '8' },
        ],
      },
      {
        name: 'Jane',
        children: [
          { name: 'Jack', age: '21' },
          { name: 'Bob', age: '15' },
        ],
      },
    ]);
  });

  it('scrape nested source', async () => {
    const src = `
      <div class="employee">
        <h1>John</h1>
        <div class="detail">
          <p>Age <span>10</span></p>
        </div>
      </div>
      <div class="employee">
        <h1>Jane</h1>
        <div class="detail">
          <p>Age <span>21</span></p>
        </div>
      </div>
    `;

    const filters = {
      number: v => parseInt(v, 10),
    };

    const scraper = new Scraper(src, '', { filters });
    const q = [{
      $root: '.employee',
      name: 'h1',
      age: source('.detail@html', 'p span | number'),
    }];
    assert.deepStrictEqual(await scraper.fetch(q), [
      {
        name: 'John',
        age: 10,
      },
      {
        name: 'Jane',
        age: 21,
      },
    ]);
  });

  it('scrape nested array of source', async () => {
    const src = `
      <h1>title</h1>
      <div class="employee">
        <h2>John</h2>
      </div>
      <div class="employee">
        <h2>Jane</h2>
      </div>
    `;

    const scraper = new Scraper(src);
    const q = {
      title: 'h1',
      employees: source(['.employee@html'], 'h2'),
    };
    assert.deepStrictEqual(await scraper.fetch(q), {
      title: 'title',
      employees: ['John', 'Jane'],
    });
  });
});
