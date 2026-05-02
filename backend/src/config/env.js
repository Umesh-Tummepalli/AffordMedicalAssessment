const path = require("path");

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInteger(process.env.PORT, 3000),
  affordmedBaseUrl:
    process.env.AFFORDMED_BASE_URL ||
    "http://20.244.56.144/evaluation-service",
  httpTimeoutMs: parseInteger(process.env.HTTP_TIMEOUT_MS, 8000),
  tokenTtlSecondsFallback: parseInteger(
    process.env.AFFORDMED_TOKEN_TTL_SECONDS,
    3300,
  ),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "",
  dataFilePath:
    process.env.URL_STORE_FILE ||
    path.join(__dirname, "..", "..", "data", "urls.json"),
  defaultCredentials: {
    email: process.env.AFFORDMED_EMAIL || "",
    name: process.env.AFFORDMED_NAME || "",
    rollNo: process.env.AFFORDMED_ROLL_NO || "",
    clientID: process.env.AFFORDMED_CLIENT_ID || "",
    clientSecret: process.env.AFFORDMED_CLIENT_SECRET || "",
  },
};
