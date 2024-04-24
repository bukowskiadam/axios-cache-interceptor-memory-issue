import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

const startServerThread = () => {
  new Worker(fileURLToPath(new URL("./server.js", import.meta.url)));
};

startServerThread();
