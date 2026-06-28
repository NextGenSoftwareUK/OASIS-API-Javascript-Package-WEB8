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

test('TranslateOutbound sends targetFormat as a query param and the MeshMessage fields as the body directly', async () => {
  const fetchImpl = fakeFetch([{ match: 'v1/protocol-bridge/translate-outbound', body: { isError: false, result: 'payload' } }]);
  const web8 = new Web8Client({ baseUrl: 'https://example.test', persistSession: false, fetchImpl });

  // TranslateOutbound(targetFormat: [FromQuery], message: [FromBody] MeshMessage) - the JSON
  // body must be the MeshMessage object's own fields, not nested under a "message" key.
  await web8.protocolBridge.translateOutbound({ targetFormat: 'Json', id: 'm1', payload: 'hello' });

  const call = fetchImpl.calls[0];
  assert.equal(call.url, 'https://example.test/v1/protocol-bridge/translate-outbound?targetFormat=Json');
  const body = JSON.parse(call.init.body);
  assert.deepEqual(body, { id: 'm1', payload: 'hello' });
});

test('TranslateInbound sends its single primitive FromBody param as the raw JSON body', async () => {
  const fetchImpl = fakeFetch([{ match: 'v1/protocol-bridge/translate-inbound', body: { isError: false, result: {} } }]);
  const web8 = new Web8Client({ baseUrl: 'https://example.test', persistSession: false, fetchImpl });

  // TranslateInbound(format/sourceNodeId/destinationNodeId: [FromQuery], rawPayload: [FromBody] string) -
  // a single primitive body param, so the body is the raw string, not {"rawPayload": "..."}.
  await web8.protocolBridge.translateInbound({
    format: 'Mqtt',
    sourceNodeId: 'a',
    destinationNodeId: 'b',
    rawPayload: '{"temp":21.5}'
  });

  const call = fetchImpl.calls[0];
  assert.match(call.url, /^https:\/\/example\.test\/v1\/protocol-bridge\/translate-inbound\?/);
  assert.match(call.url, /format=Mqtt/);
  assert.match(call.url, /sourceNodeId=a/);
  assert.match(call.url, /destinationNodeId=b/);
  const body = JSON.parse(call.init.body);
  assert.equal(body, '{"temp":21.5}');
});

test('AddLink is a POST with all-FromQuery params - no JSON body is sent', async () => {
  const fetchImpl = fakeFetch([{ match: 'v1/mesh/links', body: { isError: false, result: true } }]);
  const web8 = new Web8Client({ baseUrl: 'https://example.test', persistSession: false, fetchImpl });

  await web8.mesh.addLink({ nodeAId: 'a', nodeBId: 'b', latencyMs: 12 });

  const call = fetchImpl.calls[0];
  assert.equal(call.init.method, 'POST');
  assert.equal(call.init.body, undefined);
  assert.match(call.url, /^https:\/\/example\.test\/v1\/mesh\/links\?/);
  assert.match(call.url, /nodeAId=a/);
  assert.match(call.url, /nodeBId=b/);
  assert.match(call.url, /latencyMs=12/);
});

test('both generated modules are attached to the client', () => {
  const web8 = new Web8Client({ baseUrl: 'https://example.test', persistSession: false, fetchImpl: fakeFetch([]) });
  for (const name of ['mesh', 'protocolBridge']) {
    assert.ok(web8[name], `expected web8.${name} to be attached`);
  }
});
