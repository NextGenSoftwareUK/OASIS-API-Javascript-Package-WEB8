# ProtocolBridge — `web8.protocolBridge`

Source controller: [`ProtocolBridgeController.cs`](https://github.com/NextGenSoftwareUK/OASIS/blob/main/WEB8/NextGenSoftware.OASIS.Web8.WebAPI/Controllers/ProtocolBridgeController.cs)
Route prefix: `v1/protocol-bridge`
2 operation(s).

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

### `translateInbound`

Translates any external system's wire format into the unified WEB8 MeshMessage envelope and back.

**POST** `v1/protocol-bridge/translate-inbound`

**Request**

Body fields:

| Field | Type |
| --- | --- |
| `format` | `BridgeFormat` |
| `sourceNodeId` | `Guid` |
| `destinationNodeId` | `Guid` |
| `rawPayload` | `string` |

**Response**

Standard `OASISResult` envelope (see top of this page) with:

`result` type: `MeshMessage`

| Field | Type |
| --- | --- |
| `Id` | `Guid` |
| `SourceNodeId` | `Guid` |
| `DestinationNodeId` | `Guid` |
| `Payload` | `string` |
| `Ttl` | `int` |

**Example**

```js
const { isError, message, result } = await web8.protocolBridge.translateInbound({
    format: '<format>',
    sourceNodeId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    destinationNodeId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    rawPayload: 'example string'
  });
if (isError) throw new Error(message);
console.log(result);
```

Example response:

```json
{
  "isError": false,
  "message": "",
  "result": { "Id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "SourceNodeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "DestinationNodeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "Payload": "example string", "Ttl": 1 }
}
```

---

### `translateOutbound`

**POST** `v1/protocol-bridge/translate-outbound`

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

`result` type: `string`

**Example**

```js
const { isError, message, result } = await web8.protocolBridge.translateOutbound({
    targetFormat: '<targetFormat>',
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
  "result": "example string"
}
```

