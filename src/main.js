import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

import { startAxiosTest, printCachedEntries } from "./axios.js";
import { printUsedMemory, timeout } from "./utils.js";

const startServerThread = () =>
  new Promise((resolve) => {
    const worker = new Worker(
      fileURLToPath(new URL("./server.js", import.meta.url))
    );

    worker.on("message", () => resolve(worker));
  });

const serverWorker = await startServerThread();

printUsedMemory();

console.log("--- start test ---");

await startAxiosTest();

printCachedEntries();
printUsedMemory();

await timeout(3000);

printCachedEntries();
printUsedMemory();

serverWorker.terminate();
