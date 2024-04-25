import axios from "axios";
import { setupCache } from "axios-cache-interceptor";

import { makeRandomPathString } from "./utils.js";

const axiosCache = axios.create();

setupCache(axiosCache, {
  ttl: 10 * 1000,
});

const { SERVER_PORT = 3000 } = process.env;
const BASE_URL = `http://localhost:${SERVER_PORT}`;

let cached = 0;
let nonCached = 0;

async function request() {
  const url = `${BASE_URL}/${makeRandomPathString()}`;

  const response = await axiosCache(url);

  if (response.cached) {
    cached += 1;
  } else {
    nonCached += 1;
  }
}

async function pipeline(number) {
  while (number--) {
    await request();
  }
}

export async function startAxiosTest(
  pipelinesCount = 10,
  requestsPerPipeline = 10
) {
  const pipelines = [];

  for (let i = 0; i < pipelinesCount; i++) {
    pipelines.push(pipeline(requestsPerPipeline));
  }

  await Promise.all(pipelines);

  console.log(`[Test] Cached: ${cached} / Non-cached: ${nonCached}`);
}

export function printCachedEntries() {
  const { data } = axiosCache.storage;
  let size = 0;

  Object.values(data).forEach((cacheEntry) => {
    // simplified way to calculate size based on the fact that we return ascii strings
    size += cacheEntry.data.data.length;
  });

  console.log(`[Cache] Total entries: ${Object.keys(data).length}`);
  console.log(
    `[Cache] Entries data size: ${(size / 1024 / 1024).toFixed(2)} MB`
  );
}
