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
