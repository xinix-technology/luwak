'use strict';

/**
 * requires
 */
const Scraper = require('./scraper');

/**
 * Instantiate default scraper
 * @see Scrapper
 * @return {Scrapper}
 */
function luwak(options) {
  return new Scraper(options);
}

/**
 * export luwak
 * @type {function}
 */
module.exports = luwak;
module.exports.Scraper = Scraper;
