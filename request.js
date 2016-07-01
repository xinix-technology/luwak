'use strict';

class Request {
  constructor(context) {
    /* istanbul ignore else */
    if (context) {
      this.context = context;
      this.req = context.req;
    }
  }

  get header() {
    return this.req.headers;
  }

  get headers() {
    return this.req.headers;
  }

  get url() {
    return this.req.url;
  }

  set url(val) {
    this.req.url = val;
  }

  // get origin() {
  //   return `${this.protocol}://${this.host}`;
  // }

  // get href() {
  //   // support: `GET http://example.com/foo`
  //   if (/^https?:\/\//i.test(this.originalUrl)) return this.originalUrl;
  //   return this.origin + this.originalUrl;
  // }

  get method() {
    return this.req.method;
  }

  set method(val) {
    this.req.method = val;
  }

  // get path() {
  //   return parse(this.req).pathname;
  // }

  // set path(path) {
  //   const url = parse(this.req);
  //   if (url.pathname === path) return;

  //   url.pathname = path;
  //   url.path = null;

  //   this.url = stringify(url);
  // }

  // get query() {
  //   const str = this.querystring;
  //   const c = this._querycache = this._querycache || {};
  //   return c[str] || (c[str] = qs.parse(str));
  // }

  // set query(obj) {
  //   this.querystring = qs.stringify(obj);
  // }

  // get querystring() {
  //   if (!this.req) return '';
  //   return parse(this.req).query || '';
  // }

  // set querystring(str) {
  //   const url = parse(this.req);
  //   if (url.search === `?${str}`) return;

  //   url.search = str;
  //   url.path = null;

  //   this.url = stringify(url);
  // }

  // get search() {
  //   if (!this.querystring) return '';
  //   return `?${this.querystring}`;
  // }

  // set search(str) {
  //   this.querystring = str;
  // }

  // get host() {
  //   const proxy = this.app.proxy;
  //   let host = proxy && this.get('X-Forwarded-Host');
  //   host = host || this.get('Host');
  //   if (!host) return '';
  //   return host.split(/\s*,\s*/)[0];
  // }

  // get hostname() {
  //   const host = this.host;
  //   if (!host) return '';
  //   return host.split(':')[0];
  // }

  // get fresh() {
  //   const method = this.method;
  //   const s = this.ctx.status;

  //   // GET or HEAD for weak freshness validation only
  //   if ('GET' != method && 'HEAD' != method) return false;

  //   // 2xx or 304 as per rfc2616 14.26
  //   if ((s >= 200 && s < 300) || 304 == s) {
  //     return fresh(this.header, this.ctx.response.header);
  //   }

  //   return false;
  // }

  // get stale() {
  //   return !this.fresh;
  // }

  // get idempotent() {
  //   const methods = ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'];
  //   return !!~methods.indexOf(this.method);
  // }

  // get socket() {
  //   return this.req.socket;
  // }

  // get charset() {
  //   const type = this.get('Content-Type');
  //   if (!type) return '';

  //   return contentType.parse(type).parameters.charset || '';
  // }

  // get length() {
  //   const len = this.get('Content-Length');
  //   if (len == '') return;
  //   return ~~len;
  // }

  // get protocol() {
  //   const proxy = this.app.proxy;
  //   if (this.socket.encrypted) return 'https';
  //   if (!proxy) return 'http';
  //   const proto = this.get('X-Forwarded-Proto') || 'http';
  //   return proto.split(/\s*,\s*/)[0];
  // }

  // get secure() {
  //   return 'https' == this.protocol;
  // }

  // get ips() {
  //   const proxy = this.app.proxy;
  //   const val = this.get('X-Forwarded-For');
  //   return proxy && val
  //     ? val.split(/\s*,\s*/)
  //     : [];
  // }

  // get subdomains() {
  //   const offset = this.app.subdomainOffset;
  //   return (this.host || '')
  //     .split('.')
  //     .reverse()
  //     .slice(offset);
  // }

  // accepts() {
  //   return this.accept.types.apply(this.accept, arguments);
  // }

  // acceptsEncodings() {
  //   return this.accept.encodings.apply(this.accept, arguments);
  // }

  // acceptsCharsets() {
  //   return this.accept.charsets.apply(this.accept, arguments);
  // }

  // acceptsLanguages() {
  //   return this.accept.languages.apply(this.accept, arguments);
  // }

  // is(types) {
  //   if (!types) return typeis(this.req);
  //   if (!Array.isArray(types)) types = [].slice.call(arguments);
  //   return typeis(this.req, types);
  // }

  get type() {
    const type = this.get('Content-Type');
    if (!type) {
      return '';
    } else {
      return type.split(';')[0];
    }
  }

  get(field) {
    const req = this.req;
    field = field.toLowerCase();
    switch (field) {
      case 'referer':
      case 'referrer':
        return req.headers.referrer || req.headers.referer || '';
      default:
        return req.headers[field] || '';
    }
  }
}

module.exports = Request;