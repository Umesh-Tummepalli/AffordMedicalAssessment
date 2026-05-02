const AppError = require("../errors/AppError");

function notFound(req, res, next) {
  next(
    new AppError(
      404,
      `Route ${req.method} ${req.originalUrl} does not exist`,
      null,
      "ROUTE_NOT_FOUND",
    ),
  );
}

module.exports = notFound;
