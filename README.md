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

### OK

```bash
node --expose-gc test/ok.js
```

This is the baseline test to show the happy path, that everything works ok
and memory is cleaned out after a given time.

You should see the output like this:

```
[13:51:22.947] [Server] Running at http://localhost:3000/
[13:51:22.948] [Memory] Garbage collecting
[13:51:22.950] [Memory] Heap used: 5.37 MB
[13:51:22.950] [Test] --- start test ---
[13:51:22.950] [Test] Requesting 10 pipelines with 5 requests each
[13:51:25.393] [Test] Ended with responses: Cached: 0 / Non-cached: 50
[13:51:25.393] [Cache] Total entries: 50
[13:51:25.393] [Cache] Entries data size: 47.68 MB
[13:51:25.393] [Axios] Waiting requests: 0
[13:51:25.393] [Memory] Garbage collecting
[13:51:25.395] [Memory] Heap used: 54.12 MB
[13:51:25.395] [Timeout] Waiting for 11000 ms
[13:51:36.398] [Cache] Total entries: 0
[13:51:36.398] [Cache] Entries data size: 0.00 MB
[13:51:36.398] [Axios] Waiting requests: 0
[13:51:36.398] [Memory] Garbage collecting
[13:51:36.404] [Memory] Heap used: 6.27 MB
```

Please notice how the heap memory is back to a very low value after calling the GC.

### ETag

```bash
node --expose-gc test/etag.js
```

This test shows that cache entries are kept forever if the resource returns ETag header.

This is not a bug, but it is problematic if you fetch data from varying endpoints
and each of them returns ETag (default [`express`](https://expressjs.com/) behavior).

I thought it could be turned off with `etag` setting, but it's impossible.

The same problem applies if the server returns the `last-modified` header.

#### Solution

It can be fixed if you override `headerInterpreter` to remove those headers.
Uncomment the code in the test file to see how it cleans out the memory.
