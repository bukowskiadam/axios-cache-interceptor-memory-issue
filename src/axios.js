import { makeRandomPathString, makeVeryLongRandomString } from "./utils.js";
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

    /**
     * this is needed to trigger the issue with `waiting` promises, because
     * we use the (sliced string) which keeps the original string in memory
     * causing the url to be a 1MB object in memory
     */
    const veryLongString = makeVeryLongRandomString(1_000_000);
    const concatenated = `${veryLongString}${url}`;
    let sliced = concatenated.substring(1_000_000);
    /**
     * This is the fix for the issue with (sliced string) keeping the original
     * string in memory.
     * Uncomment to see the lower memory consumption in the waiting test.
     */
    // sliced = Buffer.from(sliced).toString("utf-8");

    const response = await axios(sliced);

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
