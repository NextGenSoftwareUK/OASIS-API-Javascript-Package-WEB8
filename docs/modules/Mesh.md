# Mesh — `web8.mesh`

Source controller: [`MeshController.cs`](https://github.com/NextGenSoftwareUK/OASIS2/blob/main/WEB8/NextGenSoftware.OASIS.Web8.WebAPI/Controllers/MeshController.cs)
Route prefix: `v1/mesh`
6 operation(s).

All methods are generated 1:1 from the controller's real `[Http*]` routes (see
[Conventions](../README.md#calling-any-endpoint)). They take a single args
object: any key matching a `{token}` in the route is substituted into the
URL; everything else becomes the query string (GET/DELETE) or JSON body
(POST/PUT).

## Methods

| Method | HTTP | Route | Route params |
| --- | --- | --- | --- |
| `addLink` | POST | `v1/mesh/links` | – |
| `computeRoute` | GET | `v1/mesh/route` | – |
| `getNodes` | GET | `v1/mesh/nodes` | – |
| `heartbeat` | POST | `v1/mesh/nodes/{nodeId}/heartbeat` | `nodeId` |
| `registerNode` | POST | `v1/mesh/nodes` | – |
| `sendMessage` | POST | `v1/mesh/send` | – |

## Example

```js
const web8 = new Web8Client({ baseUrl: '...' });
web8.setToken(jwtToken); // reuse a WEB4 JWT

const { isError, message, result } = await web8.mesh.addLink({
    /* ...other fields per the request body */
  });
if (isError) throw new Error(message);
console.log(result);
```
