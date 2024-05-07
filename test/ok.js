import axios from "axios";
import {
  buildMemoryStorage,
  defaultHeaderInterpreter,
  setupCache,
} from "axios-cache-interceptor";

import { startServerThread } from "../src/server.js";
import { runAxiosTest, printCacheSummary } from "../src/axios.js";
import { printUsedMemory, timeout } from "../src/utils.js";
import { log } from "../src/logger.js";

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
});

const serverPort = 3000;

const serverWorker = await startServerThread("cache", serverPort);

printUsedMemory();

await runAxiosTest({
  axios: axiosCache,
  serverPort,
  pipelinesCount: 10,
  requestsPerPipeline: 5,
});
printCacheSummary(axiosCache);
printUsedMemory();

await timeout(2 * CLEANUP_INTERVAL_MS + 1000);
printCacheSummary(axiosCache);
printUsedMemory();

await serverWorker.terminate();
process.exit(0); // force exit to end the cleanup interval in axios cache
