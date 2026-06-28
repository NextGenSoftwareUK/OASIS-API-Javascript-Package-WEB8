'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { Web8Client } = require('../index.js');

function fakeFetch(responses) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init });
    const match = responses.find((r) => url.includes(r.match));
    const body = match ? match.body : { isError: false, result: {} };
    return {
      ok: match ? match.ok !== false : true,
      status: match?.status || 200,
      text: async () => JSON.stringify(body)
    };
  };
  impl.calls = calls;
  return impl;
}

test('setToken attaches Bearer header to subsequent requests', async () => {
  const fetchImpl = fakeFetch([{ match: 'v1/mesh/nodes', body: { isError: false, result: { id: 'node-1' } } }]);
  const web8 = new Web8Client({ baseUrl: 'https://example.test', persistSession: false, fetchImpl });

  web8.setToken('jwt-abc');
  await web8.mesh.registerNode({ name: 'edge-1' });

  const call = fetchImpl.calls[0];
  assert.equal(call.init.headers.Authorization, 'Bearer jwt-abc');
  assert.equal(call.url, 'https://example.test/v1/mesh/nodes');
  assert.equal(call.init.method, 'POST');
});

test('route tokens are consumed from the URL', async () => {
  const fetchImpl = fakeFetch([{ match: 'v1/mesh/nodes/node-1/heartbeat', body: { isError: false, result: true } }]);
  const web8 = new Web8Client({ baseUrl: 'https://example.test', persistSession: false, fetchImpl });

  await web8.mesh.heartbeat({ nodeId: 'node-1' });

  const call = fetchImpl.calls[0];
  assert.equal(call.url, 'https://example.test/v1/mesh/nodes/node-1/heartbeat');
  assert.equal(call.init.method, 'POST');
});

test('GET requests send remaining args as query string', async () => {
  const fetchImpl = fakeFetch([{ match: 'v1/mesh/route', body: { isError: false, result: [] } }]);
  const web8 = new Web8Client({ baseUrl: 'https://example.test', persistSession: false, fetchImpl });

  await web8.mesh.computeRoute({ sourceNodeId: 'a', destinationNodeId: 'b' });

  const call = fetchImpl.calls[0];
  assert.equal(call.url, 'https://example.test/v1/mesh/route?sourceNodeId=a&destinationNodeId=b');
  assert.equal(call.init.method, 'GET');
});

test('protocol bridge translate endpoints send a JSON body', async () => {
  const fetchImpl = fakeFetch([{ match: 'v1/protocol-bridge/translate-outbound', body: { isError: false, result: 'payload' } }]);
  const web8 = new Web8Client({ baseUrl: 'https://example.test', persistSession: false, fetchImpl });

  await web8.protocolBridge.translateOutbound({ targetFormat: 'Json', message: { id: 'm1' } });

  const call = fetchImpl.calls[0];
  assert.equal(call.url, 'https://example.test/v1/protocol-bridge/translate-outbound');
  const body = JSON.parse(call.init.body);
  assert.deepEqual(body, { targetFormat: 'Json', message: { id: 'm1' } });
});

test('both generated modules are attached to the client', () => {
  const web8 = new Web8Client({ baseUrl: 'https://example.test', persistSession: false, fetchImpl: fakeFetch([]) });
  for (const name of ['mesh', 'protocolBridge']) {
    assert.ok(web8[name], `expected web8.${name} to be attached`);
  }
});
