import { createServer } from "node:http";
import { isMainThread, parentPort, workerData } from "node:worker_threads";

import { makeVeryLongRandomString } from "./utils.js";
import { log } from "./logger.js";

const SERVER_PORT = workerData.port;

const server = createServer((req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "public, max-age=3");
  res.end(makeVeryLongRandomString(1_000_000));
});

server.listen(SERVER_PORT, () => {
  log(`[Server] Running at http://localhost:${SERVER_PORT}/`);

  if (!isMainThread) {
    parentPort.postMessage("ready");
  }
});
