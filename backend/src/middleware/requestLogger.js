const appLogger = require("../services/logService");

function requestLogger(req, res, next) {
  void appLogger.info(
    "middleware",
    `request started method=${req.method} path=${req.originalUrl} requestId=${req.requestId}`,
  );

  res.on("finish", () => {
    const durationMs = Date.now() - req.requestStartedAt;
    const level =
      res.statusCode >= 500
        ? "error"
        : res.statusCode >= 400
          ? "warn"
          : "info";

    void appLogger.log({
      level,
      packageName: "middleware",
      message: `request completed method=${req.method} path=${req.originalUrl} status=${res.statusCode} durationMs=${durationMs} requestId=${req.requestId}`,
    });
  });

  next();
}

module.exports = requestLogger;
