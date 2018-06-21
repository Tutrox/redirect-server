# redirect-server
Small server that uses MongoDB for redirecting. Can be used as an self-hosted shortlink service for example.

**TODO**: Create an interactive UI to manage the server with.

## Usage

There's a small setup needed to get the server up and running...

### `.env`

Create a `.env` file in the server root directory. Set these values:

```
RS_NAME=Development
RS_PORT=2000
RS_DATABASE=mongodb://localhost/rs-development
RS_SECRET=supersecret
```

- `RS_NAME` is the name for the server, use anything you like
- `RS_PORT` is the port where the server runs on, there's no default value built in!
- `RS_DATABASE` is the MongoDB connection URL
- `RS_SECRET` is a secret for JSON Web Tokens (_more later_)

### MongoDB

The redirects will be saved to MongoDB to the **`redirects`** collection. Every entry looks like this:

```json
{
  "path": "example",
  "destination": "http://example.com",
  "type": 307
}
```

- `path` is the server path, so in this case the redirect would happen when visiting `http://your-redirect-server.com/example`
- `destination` is the URL where to redirect the user
- `type` is the HTTP status code, recommended codes are 301 (permanent) and 307 (temporary)

### (Server-side) cache

redirect-server uses a cache that will reset when the server restarts. In case that you want to clear the case for **one** path, you have to do this:

- Sign a JSON Web Token using the secret in `RS_SECRET` (**security**: make sure that the JWT expires in a short time)
- Send a **`DELETE`** request to `http://your-redirect-server.com/rs/cache/<PATH>`
 - Use this header: `Authorization: Bearer <YOUR JSON WEB TOKEN>`

If we want to reset the cache for the example redirect that we created earlier we send a `DELETE` request to `http://your-redirect-server.com/rs/cache/example` with the header `Authorization: Bearer jU5tANex4mplEt0ken`.

#### When should the cache be emptied?

The primary reason is if you have **updated** and redirect in the database. redirect-server will not notice this if the redirect is in the internal cache.
