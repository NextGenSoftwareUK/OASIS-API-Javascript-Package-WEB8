# ProtocolBridge — `web8.protocolBridge`

Source controller: [`ProtocolBridgeController.cs`](https://github.com/NextGenSoftwareUK/OASIS2/blob/main/WEB8/NextGenSoftware.OASIS.Web8.WebAPI/Controllers/ProtocolBridgeController.cs)
Route prefix: `v1/protocol-bridge`
2 operation(s).

All methods are generated 1:1 from the controller's real `[Http*]` routes (see
[Conventions](../README.md#calling-any-endpoint)). They take a single args
object: any key matching a `{token}` in the route is substituted into the
URL; everything else becomes the query string (GET/DELETE) or JSON body
(POST/PUT).

## Methods

| Method | HTTP | Route | Route params |
| --- | --- | --- | --- |
| `translateInbound` | POST | `v1/protocol-bridge/translate-inbound` | – |
| `translateOutbound` | POST | `v1/protocol-bridge/translate-outbound` | – |

## Example

```js
const web8 = new Web8Client({ baseUrl: '...' });
web8.setToken(jwtToken); // reuse a WEB4 JWT

const { isError, message, result } = await web8.protocolBridge.translateInbound({
    /* ...other fields per the request body */
  });
if (isError) throw new Error(message);
console.log(result);
```
