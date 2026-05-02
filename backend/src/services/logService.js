const axios = require("axios");

const env = require("../config/env");
const { LOG_LEVELS, LOG_PACKAGES, LOG_STACKS } = require("../config/logging");
const { getValidAccessToken } = require("./affordmedAuthService");

const logClient = axios.create({
  baseURL: env.affordmedBaseUrl,
  timeout: env.httpTimeoutMs,
  headers: {
    "Content-Type": "application/json",
  },
});

const bufferedLogs = [];
const MAX_BUFFERED_LOGS = 100;

function pushBufferedLog(entry) {
  bufferedLogs.push({
    ...entry,
    bufferedAt: new Date().toISOString(),
  });

  if (bufferedLogs.length > MAX_BUFFERED_LOGS) {
    bufferedLogs.shift();
  }
}

function normalizeLogPayload({
  stack = "backend",
  level = "info",
  packageName = "utils",
  message,
}) {
  return {
    stack: LOG_STACKS.includes(stack) ? stack : "backend",
    level: LOG_LEVELS.includes(level) ? level : "info",
    package: LOG_PACKAGES.includes(packageName) ? packageName : "utils",
    message: typeof message === "string" ? message : JSON.stringify(message),
  };
}

async function transmitLog(payload, allowRetry = true) {
  try {
    const tokenState = await getValidAccessToken();
    const response = await logClient.post("/logs", payload, {
      headers: {
        Authorization: `${tokenState.tokenType} ${tokenState.accessToken}`,
      },
    });

    return {
      sent: true,
      response: response.data,
    };
  } catch (error) {
    if (allowRetry && error.response?.status === 401) {
      await getValidAccessToken({ forceRefresh: true });
      return transmitLog(payload, false);
    }

    pushBufferedLog({
      payload,
      reason:
        error.response?.data?.message ||
        error.message ||
        "log transmission failed",
    });

    return {
      sent: false,
      reason:
        error.response?.data?.message ||
        error.message ||
        "log transmission failed",
    };
  }
}

async function log({ stack = "backend", level = "info", packageName, message }) {
  const payload = normalizeLogPayload({ stack, level, packageName, message });
  return transmitLog(payload);
}

async function debug(packageName, message) {
  return log({ level: "debug", packageName, message });
}

async function info(packageName, message) {
  return log({ level: "info", packageName, message });
}

async function warn(packageName, message) {
  return log({ level: "warn", packageName, message });
}

async function error(packageName, message) {
  return log({ level: "error", packageName, message });
}

async function fatal(packageName, message) {
  return log({ level: "fatal", packageName, message });
}

function getBufferedLogs() {
  return [...bufferedLogs];
}

let isFlushing = false;
const FLUSH_INTERVAL_MS = 10000;

setInterval(async () => {
  if (isFlushing || bufferedLogs.length === 0) {
    return;
  }

  isFlushing = true;
  
  try {
    const logsToFlush = [...bufferedLogs];
    bufferedLogs.length = 0; // Clear buffer

    for (const entry of logsToFlush) {
      await transmitLog(entry.payload);
    }
  } finally {
    isFlushing = false;
  }
}, FLUSH_INTERVAL_MS).unref(); // unref so it doesn't prevent server from exiting if needed

module.exports = {
  debug,
  error,
  fatal,
  getBufferedLogs,
  info,
  log,
  warn,
};
