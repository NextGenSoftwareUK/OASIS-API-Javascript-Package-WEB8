# Mesh — `web8.mesh`

Source controller: [`MeshController.cs`](https://github.com/NextGenSoftwareUK/OASIS2/blob/main/WEB8/NextGenSoftware.OASIS.Web8.WebAPI/Controllers/MeshController.cs)
Route prefix: `v1/mesh`
6 operation(s).

Every method takes a single args object: any key matching a `{token}` in the route is substituted into the URL; everything else becomes the query string (GET/DELETE) or JSON body (POST/PUT). Every call resolves to the standard OASIS envelope:

```ts
{
  isError: boolean;
  isWarning: boolean;
  message: string;
  errorCode?: string;
  result: T; // see each endpoint's Response section below
}
```

## Operations

### `addLink`

**POST** `v1/mesh/links`

**Request**

Body fields:

| Field | Type |
| --- | --- |
| `nodeAId` | `Guid` |
| `nodeBId` | `Guid` |
| `latencyMs` | `double (optional)` |

**Response**

Standard `OASISResult` envelope (see top of this page) with:

`result` type: `bool`

**Example**

```js
const { isError, message, result } = await web8.mesh.addLink({
    nodeAId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    nodeBId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    latencyMs: 1.0
  });
if (isError) throw new Error(message);
console.log(result);
```

Example response:

```json
{
  "isError": false,
  "message": "",
  "result": true
}
```

---

### `computeRoute`

**GET** `v1/mesh/route`

**Request**

Query parameters:

| Field | Type |
| --- | --- |
| `sourceNodeId` | `Guid` |
| `destinationNodeId` | `Guid` |

**Response**

Standard `OASISResult` envelope (see top of this page) with:

`result` type: `Guid` (array)

**Example**

```js
const { isError, message, result } = await web8.mesh.computeRoute({
    sourceNodeId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    destinationNodeId: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
  });
if (isError) throw new Error(message);
console.log(result);
```

Example response:

```json
{
  "isError": false,
  "message": "",
  "result": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"]
}
```

---

### `getNodes`

**GET** `v1/mesh/nodes`

**Request**

No request body.

**Response**

Standard `OASISResult` envelope (see top of this page) with:

`result` type: `GalacticNode` (array)

| Field | Type |
| --- | --- |
| `Id` | `Guid` |
| `Name` | `string` |
| `Type` | `NodeType` |
| `EndpointUrl` | `string` |
| `IsSovereign` | `bool` |
| `RegisteredUtc` | `DateTime` |
| `LastSeenUtc` | `DateTime` |

**Example**

```js
const { isError, message, result } = await web8.mesh.getNodes({});
if (isError) throw new Error(message);
console.log(result);
```

Example response:

```json
{
  "isError": false,
  "message": "",
  "result": [{ "Id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "Name": "example string", "Type": {  }, "EndpointUrl": "example string", "IsSovereign": true, "RegisteredUtc": "2026-01-01T00:00:00Z", "LastSeenUtc": "2026-01-01T00:00:00Z" }]
}
```

---

### `heartbeat`

**POST** `v1/mesh/nodes/{nodeId}/heartbeat`

Route parameters:

| Field | Type |
| --- | --- |
| `nodeId` | `Guid` |

**Request**

No request body.

**Response**

Standard `OASISResult` envelope (see top of this page) with:

`result` type: `bool`

**Example**

```js
const { isError, message, result } = await web8.mesh.heartbeat({
    nodeId: '<nodeId>'
  });
if (isError) throw new Error(message);
console.log(result);
```

Example response:

```json
{
  "isError": false,
  "message": "",
  "result": true
}
```

---

### `registerNode`

The WEB8 fractal holonic mesh - register nodes, declare links, compute routes and relay messages with self-healing failover.

**POST** `v1/mesh/nodes`

**Request**

Body type: `GalacticNode`

| Field | Type |
| --- | --- |
| `Id` | `Guid` |
| `Name` | `string` |
| `Type` | `NodeType` |
| `EndpointUrl` | `string` |
| `IsSovereign` | `bool` |
| `RegisteredUtc` | `DateTime` |
| `LastSeenUtc` | `DateTime` |

**Response**

Standard `OASISResult` envelope (see top of this page) with:

`result` type: `GalacticNode`

| Field | Type |
| --- | --- |
| `Id` | `Guid` |
| `Name` | `string` |
| `Type` | `NodeType` |
| `EndpointUrl` | `string` |
| `IsSovereign` | `bool` |
| `RegisteredUtc` | `DateTime` |
| `LastSeenUtc` | `DateTime` |

**Example**

```js
const { isError, message, result } = await web8.mesh.registerNode({
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    name: "example string",
    type: {  },
    endpointUrl: "example string",
    isSovereign: true,
    registeredUtc: "2026-01-01T00:00:00Z",
    lastSeenUtc: "2026-01-01T00:00:00Z"
  });
if (isError) throw new Error(message);
console.log(result);
```

Example response:

```json
{
  "isError": false,
  "message": "",
  "result": { "Id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "Name": "example string", "Type": {  }, "EndpointUrl": "example string", "IsSovereign": true, "RegisteredUtc": "2026-01-01T00:00:00Z", "LastSeenUtc": "2026-01-01T00:00:00Z" }
}
```

---

### `sendMessage`

Routes and relays a message hop-by-hop to its destination, self-healing around any failed/stale node.

**POST** `v1/mesh/send`

**Request**

Body type: `MeshMessage`

| Field | Type |
| --- | --- |
| `Id` | `Guid` |
| `SourceNodeId` | `Guid` |
| `DestinationNodeId` | `Guid` |
| `Payload` | `string` |
| `Ttl` | `int` |

**Response**

Standard `OASISResult` envelope (see top of this page) with:

`result` type: `MeshRouteResult`

| Field | Type |
| --- | --- |
| `MessageId` | `Guid` |
| `Path` | `List<Guid>` |
| `TotalLatencyMs` | `double` |
| `Delivered` | `bool` |
| `RelayLog` | `List<string>` |

**Example**

```js
const { isError, message, result } = await web8.mesh.sendMessage({
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    sourceNodeId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    destinationNodeId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    payload: "example string",
    ttl: 1
  });
if (isError) throw new Error(message);
console.log(result);
```

Example response:

```json
{
  "isError": false,
  "message": "",
  "result": { "MessageId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "Path": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"], "TotalLatencyMs": 1.0, "Delivered": true, "RelayLog": ["example string"] }
}
```

