import { log } from "./logger.js";

const RANDOM_STRING_LENGTH = 5;

function makeRandomString() {
  return Math.random()
    .toString(36)
    .substring(2, 2 + RANDOM_STRING_LENGTH)
    .padEnd(RANDOM_STRING_LENGTH, "0");
}

export function makeVeryLongRandomString(length) {
  const result = [];
  for (let i = 0; i < length / RANDOM_STRING_LENGTH; i++) {
    result.push(makeRandomString());
  }
  return result.join("");
}

export function makeRandomPathString() {
  return `${makeRandomString()}/${makeRandomString()}/${makeRandomString()}`;
}

export function printUsedMemory() {
  if (global.gc) {
    log("[Memory] Garbage collecting");
    global.gc();
  } else {
    log(
      "[Memory] Garbage collection unavailable. Pass --expose-gc when launching node."
    );
  }

  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  log(`[Memory] Heap used: ${used.toFixed(2)} MB`);
}

export function timeout(ms) {
  log(`[Timeout] Waiting for ${ms} ms`);

  const interval = setInterval(() => {
    process.stdout.write(".");
  }, 1000);
  return new Promise((resolve) =>
    setTimeout(() => {
      clearInterval(interval);
      process.stdout.write("\r");
      resolve();
    }, ms)
  );
}
