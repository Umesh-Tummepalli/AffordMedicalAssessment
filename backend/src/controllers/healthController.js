const asyncHandler = require("../middleware/asyncHandler");
const appLogger = require("../services/logService");

const getHealth = asyncHandler(async (req, res) => {
  await appLogger.debug(
    "config",
    `health check served requestId=${req.requestId}`,
  );

  res.status(200).json({
    success: true,
    data: {
      service: "affordmed-backend-submission",
      status: "ok",
      timestamp: new Date().toISOString(),
      bufferedLogCount: appLogger.getBufferedLogs().length,
    },
  });
});

module.exports = {
  getHealth,
};
