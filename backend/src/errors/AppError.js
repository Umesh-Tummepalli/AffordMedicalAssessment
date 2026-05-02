class AppError extends Error {
  constructor(statusCode, message, details = null, code = "APP_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
    this.isOperational = true;
  }
}

module.exports = AppError;
