const puppeteer = require('puppeteer');

class Scraper {
  constructor (src, query, { filters, browser, autoClose = true } = {}) {
    this.src = src;
    this.query = query || 'body';
    this.browser = browser;
    this.filters = filters;
    this.autoClose = autoClose;
  }

  async close () {
    if (this.page) {
      await this.page.close();
      this.page = undefined;
    }
  }

  async fetch (query) {
    const page = await this._getPage();

    try {
      const result = await this._fetchFromRoot(page, query);
      return result;
    } finally {
      if (this.autoClose) {
        await this.close();
      }
    }
  }

  async _getPage () {
    if (this.page) {
      return this.page;
    }

    this.page = await acquire(this.src, this.browser);
    return this.page;
  }

  _fetchFromRoot (rootEl, query) {
    query = query || this.query;

    const multi = Array.isArray(query);
    if (multi && query.length > 1) {
      return this._fetchChild(rootEl, ...query);
    }

    const q = multi ? query[0] : query;
    switch (typeof q) {
      case 'string':
        return this._fetchScalar(rootEl, q, multi);
      case 'function':
        return this._fetchFunction(rootEl, q);
      case 'object':
        return this._fetchObject(rootEl, q, multi);
    }

    console.error('Unknown query', query);

    throw new Error('Unknown query');
  }

  async _fetchScalar (rootEl, q, multi) {
    const { sel, kind, filters } = this._parseScalarQuery(q);

    try {
      const result = await rootEl.$$eval(sel, (els, aKind) => {
        return els.map(el => {
          if (aKind === 'html') {
            return el.innerHTML;
          }

          return el.textContent;
        });
      }, kind);

      if (multi) {
        return result.map(r => filters.reduce((anR, fn) => fn(anR), r));
      }

      return filters.reduce((anR, fn) => fn(anR), result[0]);
    } catch (err) {
      if (err.message.includes('failed to find element matching selector')) {
        return;
      }

      throw err;
    }
  }

  async _fetchChild (rootEl, src, q) {
    if (typeof src === 'string') {
      const anSrc = await this._fetchScalar(rootEl, src, false);
      const child = new Scraper(anSrc, q, this);
      return child.fetch();
    }

    if (!Array.isArray(src)) {
      throw new Error('Invalid sub source');
    }

    const srcs = await this._fetchScalar(rootEl, src[0], true);

    const result = [];

    for (const anSrc of srcs) {
      const child = new Scraper(anSrc, q, this);
      result.push(await child.fetch());
    }

    return result;
  }

  copy (parent, src) {
    const { browser, filters, autoClose } = parent;
    return new Scraper({
      ...this,
      browser,
      filters,
      autoClose,
      src,
    });
  }

  _fetchFunction (rootEl, q) {
    return rootEl.evaluate(q);
  }

  async _fetchObject (rootEl, q, multi) {
    const qRoots = q.$root ? await rootEl.$$(q.$root) : [rootEl];

    const result = [];

    for (const qRoot of qRoots) {
      const row = {};
      for (const key in q) {
        if (key === '$root') {
          continue;
        }

        row[key] = await this._fetchFromRoot(qRoot, q[key]);
      }

      result.push(row);
    }

    return multi ? result : result[0];
  }

  _parseScalarQuery (q) {
    const [qSel, ...qFilters] = q.split('|');
    const [sel, kind = 'text'] = qSel.split('@');
    return {
      sel: sel.trim(),
      kind: kind.trim(),
      filters: qFilters.map(name => this.filters[name.trim()] || unknownFilter),
    };
  }
}

/**
 * @type {puppeteer.Browser}
 */
let globalBrowser;

async function getGlobalBrowser () {
  if (!globalBrowser) {
    globalBrowser = await puppeteer.launch();
  }

  return globalBrowser;
}

/**
 * @returns {Promise<puppeteer.Page>}
 */
async function acquire (src, browser) {
  if (!browser) {
    browser = await getGlobalBrowser();
  }

  const page = await browser.newPage();

  if (isUrl(src)) {
    await loadUrl(page, src);
  } else {
    await loadDoc(page, src);
  }

  return page;
}

function isUrl (u) {
  return (u || '').split('://').length > 1;
}

async function release () {
  if (!globalBrowser) {
    return;
  }

  await globalBrowser.close();
}

async function loadUrl (page, src) {
  await page.goto(src, { waitUntil: 'domcontentloaded' });
}

async function loadDoc (page, src) {
  await page.evaluate(content => {
    const doc = document.open('text/html', 'replace');
    doc.write(content);
    doc.close();
  }, src);
}

function source (src, q) {
  return [src, q];
}

module.exports.Scraper = Scraper;
module.exports.release = release;
module.exports.source = source;

function unknownFilter () {
  throw new Error('Unknown filter');
}
