import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

export function startServerThread(port = 3000) {
  return new Promise((resolve) => {
    const worker = new Worker(
      fileURLToPath(new URL("./server-worker.js", import.meta.url)),
      {
        workerData: {
          port,
        },
      }
    );

    worker.on("message", () => resolve(worker));
  });
}
