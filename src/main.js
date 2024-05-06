import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

import { startAxiosTest, printCachedEntries } from "./axios.js";
import { printUsedMemory, timeout } from "./utils.js";
import { log } from "./logger.js";

const startServerThread = () =>
  new Promise((resolve) => {
    const worker = new Worker(
      fileURLToPath(new URL("./server-worker.js", import.meta.url)),
      {
        workerData: {
          port: 3000,
        },
      }
    );

    worker.on("message", () => resolve(worker));
  });

const serverWorker = await startServerThread();

printUsedMemory();

log("--- start test ---");

await startAxiosTest();

printCachedEntries();
printUsedMemory();

await timeout(13000);

printCachedEntries();
printUsedMemory();

serverWorker.terminate();
process.exit(0); // force exit to end the cleanup interval in axios cache
