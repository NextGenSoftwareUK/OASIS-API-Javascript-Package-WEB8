# web8-oasis-galactic-mesh-api

Isomorphic (Node 18+ and browser) JavaScript/TypeScript-friendly client for the
**WEB8 OASIS Galactic Mesh API** - fractal holonic mesh node registration,
link/route computation, self-healing message relay, and protocol-bridge
translation between external wire formats and the unified `MeshMessage`
envelope, built on the OASIS2 WEB8 WebAPI.

Zero dependencies. Wraps the global `fetch`. Works the same in Node and the
browser.

## Installation

```bash
npm install web8-oasis-galactic-mesh-api
```

## Quick start

```js
const { Web8Client } = require('web8-oasis-galactic-mesh-api');
// or: import { Web8Client } from 'web8-oasis-galactic-mesh-api';

const web8 = new Web8Client({ baseUrl: 'https://api.web8.oasisomniverse.one' });

const { isError, message, result } = await web8.mesh.registerNode({ name: 'edge-node-1' });
if (isError) throw new Error(message);
console.log(result);
```

## Calling any endpoint

Every controller on the OASIS2 WEB8 WebAPI is reachable as a lowerCamel
property on the client (`web8.mesh`, `web8.protocolBridge`). Every generated
method takes a single args object:

- Any key matching a `{token}` in the route template is consumed and
  substituted into the URL (case-insensitive match).
- Any remaining keys become the query string (GET/DELETE) or JSON body
  (POST/PUT) - **matching the real `[FromQuery]`/`[FromBody]` binding of the
  underlying C# action**, not just the HTTP verb. `endpoints.json` records
  exactly which arg names are query-bound (and which single arg is the whole
  body, for actions like `TranslateInbound` whose entire body is one
  primitive `[FromBody] string`) per operation - see [`docs/`](./docs/README.md)
  for the per-method breakdown.

```js
// POST v1/mesh/nodes/{nodeId}/heartbeat -> nodeId consumed as a route token
await web8.mesh.heartbeat({ nodeId });

// GET v1/mesh/route -> all args become query params
const route = await web8.mesh.computeRoute({ sourceNodeId, destinationNodeId });

// POST v1/mesh/links -> nodeAId/nodeBId/latencyMs are all [FromQuery] even
// though this is a POST, so they're sent on the URL - no JSON body is sent
await web8.mesh.addLink({ nodeAId, nodeBId, latencyMs: 12 });

// POST v1/protocol-bridge/translate-inbound -> format/sourceNodeId/destinationNodeId
// are [FromQuery]; rawPayload is the single [FromBody] string, so it becomes
// the raw JSON body itself (not wrapped in an object)
const inbound = await web8.protocolBridge.translateInbound({
  format: 'Mqtt', sourceNodeId, destinationNodeId, rawPayload: '{"temp":21.5}'
});
```

Every response has the shape:

```ts
interface OASISResponse<T = any> {
  isError: boolean;
  message: string | null;
  result: T;
  raw: any;
  statusCode: number;
}
```

## Auth

WEB8 is an internal galactic-mesh/protocol-bridge layer that sits behind the
same OASIS avatar identity as WEB4/WEB5/WEB6/WEB7 - it has no avatar/login
endpoints of its own. Reuse a JWT you've already obtained elsewhere (e.g.
from `web4-oasis-api`'s `client.auth.login()`):

```js
web8.setToken(jwtToken);
```

## Module examples

### Mesh (`web8.mesh`)

```js
const nodeA = await web8.mesh.registerNode({ name: 'edge-node-a' });
const nodeB = await web8.mesh.registerNode({ name: 'edge-node-b' });
await web8.mesh.addLink({ nodeAId: nodeA.result.id, nodeBId: nodeB.result.id, latencyMs: 12 });
await web8.mesh.heartbeat({ nodeId: nodeA.result.id });

const route = await web8.mesh.computeRoute({ sourceNodeId: nodeA.result.id, destinationNodeId: nodeB.result.id });
const relay = await web8.mesh.sendMessage({ sourceNodeId: nodeA.result.id, destinationNodeId: nodeB.result.id, payload: 'hello' });
```

### Protocol Bridge (`web8.protocolBridge`)

```js
const inbound = await web8.protocolBridge.translateInbound({
  format: 'Mqtt',
  sourceNodeId,
  destinationNodeId,
  rawPayload: '{"temp":21.5}'
});

// targetFormat is [FromQuery]; the rest of the args become the MeshMessage
// JSON body directly (not nested under a "message" key)
const outbound = await web8.protocolBridge.translateOutbound({ targetFormat: 'Json', ...inbound.result });
```

## Module reference

2 modules, 8 operations in total. Full per-method tables live in
[`docs/`](./docs/README.md).

| Client property | Route prefix | Operations |
| --- | --- | --- |
| `web8.mesh` | `v1/mesh` | 6 |
| `web8.protocolBridge` | `v1/protocol-bridge` | 2 |

See [`docs/README.md`](./docs/README.md) for the full generated reference,
or [`docs/modules/`](./docs/modules) for per-module method tables with
parameter and route details.

## Regenerating

The generated modules, type declarations and docs are produced from
`endpoints.json` (extracted from the WEB8 WebAPI controller source):

```bash
npm run generate   # src/modules/*.js + src/modules/index.js
npm run types      # src/modules/*.d.ts + index.d.ts + src/core/types.d.ts
npm run docs       # docs/README.md + docs/modules/*.md
```

## Testing

```bash
npm test
```

## License

MIT
