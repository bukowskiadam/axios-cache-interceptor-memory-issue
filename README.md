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

Sample output:

```
[13:56:29.788] [Info] This test is about to show that cache entries are kept forever if etag is returned by the server.

[13:56:29.827] [Server] Running at http://localhost:3000/
[13:56:29.828] [Memory] Garbage collecting
[13:56:29.830] [Memory] Heap used: 5.26 MB
[13:56:29.830] [Test] --- start test ---
[13:56:29.830] [Test] Requesting 10 pipelines with 5 requests each
[13:56:32.513] [Test] Ended with responses: Cached: 0 / Non-cached: 50
[13:56:32.514] [Cache] Total entries: 50
[13:56:32.514] [Cache] Entries data size: 47.68 MB
[13:56:32.514] [Axios] Waiting requests: 0
[13:56:32.514] [Memory] Garbage collecting
[13:56:32.516] [Memory] Heap used: 54.09 MB
[13:56:32.516] [Timeout] Waiting for 6000 ms
[13:56:38.518] [Cache] Total entries: 50
[13:56:38.518] [Cache] Entries data size: 47.68 MB
[13:56:38.519] [Axios] Waiting requests: 0
[13:56:38.519] [Memory] Garbage collecting
[13:56:38.527] [Memory] Heap used: 53.97 MB
```

#### Solution

It can be fixed if you override `headerInterpreter` to remove those headers.
Uncomment the code in the test file to see how it cleans out the memory.

### Waiting

```bash
node --expose-gc test/waiting.js
```

This test shows the problem with hanging promises in the `axios.waiting` object.

When there is a limit on the in-memory cache entries, they are removed when the
new entries are about to be stored, but the related deferred promises in the
`axios.waiting` are not cleared after the requests are resolved.

This makes the `axios.waiting` object to grow over time if you do not hit
the same request again (having the same unique key).

In my case the problem was that we extracted the URL from the long document,
what caused v8 engine to use `(sliced string)` type of the object, which keeps
the reference to the original (long) string in memory, so every waiting promise
caused to store many kB in memory. To show the issue I have added this logic
in the test - creating a very long string, then take just the part of it.

Sample output:

```
[08:45:12.258] [Info] This test is about to show that max entries setting causes that some waiting promises are kept even if the request has finished.

[08:45:12.295] [Server] Running at http://localhost:3000/
[08:45:12.296] [Memory] Garbage collecting
[08:45:12.298] [Memory] Heap used: 5.32 MB
[08:45:12.298] [Test] --- start test ---
[08:45:12.298] [Test] Requesting 10 pipelines with 5 requests each
[08:45:15.307] [Test] Ended with responses: Cached: 0 / Non-cached: 50
[08:45:15.308] [Cache] Total entries: 9
[08:45:15.308] [Cache] Entries data size: 8.58 MB
[08:45:15.308] [Axios] Waiting requests: 19
[08:45:15.308] [Memory] Garbage collecting
[08:45:15.310] [Memory] Heap used: 47.65 MB
[08:45:15.310] [Timeout] Waiting for 11000 ms
[08:45:26.312] [Cache] Total entries: 0
[08:45:26.312] [Cache] Entries data size: 0.00 MB
[08:45:26.312] [Axios] Waiting requests: 19
[08:45:26.312] [Memory] Garbage collecting
[08:45:26.315] [Memory] Heap used: 24.42 MB
```

Please notice the Heap used. The formula to verify keeping the original string
in memory is something like:
```
<hanging requests> * 1_000_000 bytes + the initial memory consumption
```

#### Solution

1. In my opinion this is a bug in axios-cache-interceptor that `axios.waiting`
   is not cleared then the request is resolved, but it was removed from
   the in-memory adapter due to the max entries limit.
2. Solution for the `(sliced string)` problem is to clone bytes into
   the new Buffer and stringify it back again. This creates a fresh string
   object, that does not keep the reference to the original (long) string.
   I've left code to uncomment in the `src/axios.js:31`
