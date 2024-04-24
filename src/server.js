import { createServer } from "node:http";

import { makeVeryLongRandomString } from "./utils.js";

const { SERVER_PORT = 3000 } = process.env;

const server = createServer((req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.end(makeVeryLongRandomString(1_000_000));
});

server.listen(SERVER_PORT, () => {
  console.log(`Server running at http://localhost:${SERVER_PORT}/`);
});
