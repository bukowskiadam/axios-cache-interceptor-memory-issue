import axios from "axios";
import { buildMemoryStorage, setupCache } from "axios-cache-interceptor";

import { startServerThread } from "../src/server.js";
import { runAxiosTest, printCacheSummary } from "../src/axios.js";
import { timeout } from "../src/utils.js";

const axiosCache = axios.create();

const CLONE_DATA = false;
const CLEANUP_INTERVAL_MS = 5 * 1000;
const MAX_ENTRIES = undefined;

const storage = buildMemoryStorage(
  CLONE_DATA,
  CLEANUP_INTERVAL_MS,
  MAX_ENTRIES
);

setupCache(axiosCache, {
  ttl: 10 * 1000,
  storage,
  /* this could disable handling etag in the response but it's not working as I expected it */
  etag: false,
});

const serverPort = 3000;

const serverWorker = await startServerThread(serverPort);

await runAxiosTest({
  axios: axiosCache,
  serverPort,
  pipelinesCount: 10,
  requestsPerPipeline: 5,
});
printCacheSummary(axiosCache);

await timeout(CLEANUP_INTERVAL_MS + 1000);
printCacheSummary(axiosCache);

await serverWorker.terminate();
process.exit(0); // force exit to end the cleanup interval in axios cache
