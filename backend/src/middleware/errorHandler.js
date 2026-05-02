const AppError = require("../errors/AppError");
const appLogger = require("../services/logService");

function isJsonSyntaxError(error) {
  return error instanceof SyntaxError && error.status === 400 && "body" in error;
}

async function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let finalError = error;

  if (isJsonSyntaxError(error)) {
    finalError = new AppError(
      400,
      "Malformed JSON request body.",
      null,
      "INVALID_JSON",
    );
  }

  const statusCode = finalError.statusCode || 500;
  const message =
    statusCode >= 500 ? "Internal Server Error" : finalError.message;

  await appLogger.error(
    "middleware",
    `request failed method=${req.method} path=${req.originalUrl} status=${statusCode} requestId=${req.requestId} error=${finalError.message}`,
  );

  return res.status(statusCode).json({
    success: false,
    error: {
      code: finalError.code || "INTERNAL_ERROR",
      message,
      details: finalError.details || null,
      requestId: req.requestId,
    },
  });
}

module.exports = errorHandler;
