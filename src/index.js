'use strict';

const { HttpClient, DEFAULT_BASE_URL } = require('./core/httpClient');
const { TokenStore } = require('./core/tokenStore');
const { attachGeneratedModules } = require('./modules/index');

/**
 * Main SDK entry point. Works in Node 18+ and any modern browser.
 *
 *   const { Web8Client } = require('@oasisomniverse/web8-api');
 *   const web8 = new Web8Client({ baseUrl: 'https://api.web8.oasisomniverse.one' });
 *   web8.setToken(jwtToken); // reuse a WEB4 OASIS JWT - WEB8 has no auth of its own
 *   const node = await web8.mesh.registerNode({ name: 'edge-node-1' });
 *
 * Every controller on the WEB8 Mesh WebAPI is reachable as a lowerCamel
 * property (web8.mesh, web8.protocolBridge). Generated methods take a single
 * args object; route template tokens (e.g. {nodeId}) are consumed from it
 * automatically, remaining keys become the query string (GET/DELETE) or JSON
 * body (POST/PUT).
 */
class Web8Client {
  constructor({ baseUrl = DEFAULT_BASE_URL, persistSession, fetchImpl } = {}) {
    this.tokenStore = new TokenStore({ persist: persistSession });
    this.http = new HttpClient({ baseUrl, tokenStore: this.tokenStore, fetchImpl });

    attachGeneratedModules(this, this.http);
  }

  setBaseUrl(baseUrl) {
    this.http.setBaseUrl(baseUrl);
  }

  /**
   * WEB8 is an internal galactic-mesh/protocol-bridge layer sitting behind
   * the same OASIS identity as WEB4/WEB5/WEB6/WEB7 - it has no avatar/auth
   * endpoints of its own. Reuse a JWT you already obtained from the WEB4
   * OASIS API (or your own backend) here.
   */
  setToken(jwtToken, sessionExtras = {}) {
    this.tokenStore.setSession({ ...sessionExtras, jwtToken });
  }
}

module.exports = { Web8Client, HttpClient, TokenStore, DEFAULT_BASE_URL };
module.exports.default = Web8Client;
