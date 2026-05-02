const asyncHandler = require("../middleware/asyncHandler");
const appLogger = require("../services/logService");
const {
  authenticateCandidate,
  getValidAccessToken,
} = require("../services/affordmedAuthService");
const { validateAuthPayload } = require("../validators/authValidators");

const issueToken = asyncHandler(async (req, res) => {
  const payload = validateAuthPayload(req.body || {});
  const tokenState = await authenticateCandidate(payload);

  await appLogger.info(
    "auth",
    `access token issued for rollNo=${payload.rollNo} requestId=${req.requestId}`,
  );

  res.status(200).json({
    success: true,
    data: tokenState,
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const credentials =
    req.body && Object.keys(req.body).length > 0
      ? validateAuthPayload(req.body)
      : null;
  const tokenState = await getValidAccessToken({
    credentials,
    forceRefresh: true,
  });

  await appLogger.info(
    "auth",
    `access token refreshed requestId=${req.requestId}`,
  );

  res.status(200).json({
    success: true,
    data: tokenState,
  });
});

module.exports = {
  issueToken,
  refreshToken,
};
