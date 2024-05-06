function pad(num, size = 2) {
  return num.toString().padStart(size, "0");
}

export function log(...args) {
  const now = new Date();
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const milliseconds = pad(now.getMilliseconds(), 3);

  const time = `${hours}:${minutes}:${seconds}.${milliseconds}`;

  console.log(`[${time}]`, ...args);
}
