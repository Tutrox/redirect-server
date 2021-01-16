# redirect-server
Small server that uses MongoDB for redirecting. Can be used as an self-hosted shortlink service for example.

### Note!

In January 2021 project will be archived and no new changes will be made. Please also note that the server hasn't been tested in production, so be careful! You are free to borrow any code you might find useful. :smile:

Read more at https://klooven.link/archive.

## Usage

There's a small setup needed to get the server up and running...

### `.env`

Create a `.env` file in the server root directory. Set these values (_example below_):

```sh
# Base configuration
RS_NAME=Development
RS_PORT=2000
RS_DATABASE=mongodb://localhost/rs-development
# Management
RS_SECRET=realsecret
RS_ADRESS=http://myserver.com
RS_MANAGEMENT_PATH=manage
# Update checking
RS_UPDATE_GITHUB=T0k3n
RS_UPDATE_WEBHOOK=https://myhook.com/catch
# Other options
RS_ROOT_NAME=root
```

- `RS_NAME` is the name for the server, use anything you like
- `RS_PORT` is the port where the server runs on, there's no default value built in!
- `RS_DATABASE` is the MongoDB connection URL
- `RS_SECRET` is a secret for JSON Web Tokens (_more later_)
- `RS_ADRESS` is the full adress for the server
- `RS_MANAGEMENT_PATH` (optional, default is `rs`) is the path for internal pages like the info page (`http://yourserver.com/{RS_MANAGEMENT_PATH}/info`)
- `RS_UPDATE_GITHUB` (required if `RS_UPDATE_WEBHOOK` is specified) is a GitHub private access token to authenticate with the GitHub API, which is used to get the current version of `redirect-server`. The token is needed to not hit the rate limits in the API and it does not need any extra permissions.
- `RS_UPDATE_WEBHOOK` is the URL where new updates should be notified to
- `RS_ROOT_NAME` (optional, default is `index`) is the redirect name for the root URL (`http://yourserver.com/`)

### MongoDB

The redirects should be saved to MongoDB to the **`redirects`** collection. Every entry looks like this:

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

### Server-side cache

`redirect-server` uses an in-memory cache that will reset when the server restarts. In the case that you want to clear the case for **one** path without restarting the server, you have to do this:

- Sign a JSON Web Token using the secret in `RS_SECRET` (**security**: make sure that the JWT expires in a short time)
- Send a **`DELETE`** request to `http://your-redirect-server.com/{RS_MANAGEMENT_PATH}/cache/<PATH>`
  - Use this query string: `token=<YOUR JSON WEB TOKEN>`

So if we want to reset the cache for the example redirect that we created earlier we send a `DELETE` request to `http://your-redirect-server.com/rs/cache/example?token=jU5tANex4mplEt0ken`.

#### When should the cache be emptied?

The primary reason is if you have **updated** a redirect in the database. `redirect-server` will not notice this if the redirect is in the internal cache.
