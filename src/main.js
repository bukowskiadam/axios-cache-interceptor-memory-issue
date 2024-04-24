import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

import { startAxiosTest } from "./axios.js";

const startServerThread = () =>
  new Promise((resolve) => {
    const worker = new Worker(
      fileURLToPath(new URL("./server.js", import.meta.url))
    );

    worker.on("message", () => resolve(worker));
  });

const serverWorker = await startServerThread();

console.log("Server started - starting the test");

await startAxiosTest();

console.log("Test finished");

console.log(process.memoryUsage());

serverWorker.terminate();
