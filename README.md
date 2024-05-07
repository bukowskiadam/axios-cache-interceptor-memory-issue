# axios-cache-interceptor-memory-issue

This repo is about to show the problems I've encountered with the
[axios-cache-interceptor](https://axios-cache-interceptor.js.org/)

## Install

Clone the repo and install

```bash
nvm use
# or alternative way to use specified node version

npm install
```

## Tests

### ETag

```bash
node test/etag.js
```

This test shows that cache entries are kept forever if the resource returns ETag header.

This is not a bug, but it is problematic if you fetch data from varying endpoints
and each of them returns ETag (default [`express`](https://expressjs.com/) behavior).

I thought it could be turned off with `etag` setting, but it's impossible.

The same problem applies if the server returns the `last-modified` header.

#### Solution

It can be fixed if you override `headerInterpreter` to remove those headers.
Uncomment the code in the test file to see how it cleans out the memory.
