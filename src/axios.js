import { makeRandomPathString } from "./utils.js";
import { log } from "./logger.js";

export async function runAxiosTest({
  axios,
  serverPort = 3000,
  pipelinesCount = 10,
  requestsPerPipeline = 5,
}) {
  const BASE_URL = `http://localhost:${serverPort}`;

  let cached = 0;
  let nonCached = 0;

  async function request() {
    const url = `${BASE_URL}/${makeRandomPathString()}`;

    const response = await axios(url);

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

  log("[Test] --- start test ---");
  log(
    `[Test] Requesting ${pipelinesCount} pipelines with ${requestsPerPipeline} requests each`
  );

  const pipelines = [];

  for (let i = 0; i < pipelinesCount; i++) {
    pipelines.push(pipeline(requestsPerPipeline));
  }

  await Promise.all(pipelines);

  log(
    `[Test] Ended with responses: Cached: ${cached} / Non-cached: ${nonCached}`
  );
}

export function printCacheSummary(axios) {
  log(`[Cache] Total entries: ${Object.keys(axios.storage.data).length}`);
  log(`[Cache] Entries data size: ${getAxiosDataSize()} MB`);
  log(`[Axios] Waiting requests: ${Object.keys(axios.waiting).length}`);

  function getAxiosDataSize() {
    let size = 0;

    Object.values(axios.storage.data).forEach((cacheEntry) => {
      size += cacheEntry.data.data.length;
    });

    return (size / 1024 / 1024).toFixed(2);
  }
}
