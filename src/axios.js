import axios from "axios";
import { setupCache } from "axios-cache-interceptor";

import { makeRandomPathString } from "./utils.js";

const axiosCache = axios.create();

setupCache(axiosCache, {
  ttl: 10 * 1000,
});

const { SERVER_PORT = 3000 } = process.env;
const BASE_URL = `http://localhost:${SERVER_PORT}`;

function request() {
  const url = `${BASE_URL}/${makeRandomPathString()}`;
  console.log(url);

  return axiosCache(url).then((response) => {
    console.log("Response length:", response.id, response.data.length);
  });
}

async function pipeline(number) {
  while (number--) {
    await request();
  }
}

export function startAxiosTest(pipelinesCount = 10, requestsPerPipeline = 10) {
  const pipelines = [];

  for (let i = 0; i < pipelinesCount; i++) {
    pipelines.push(pipeline(requestsPerPipeline));
  }

  return Promise.all(pipelines);
}
