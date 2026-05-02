const asyncHandler = require("../middleware/asyncHandler");
const appLogger = require("../services/logService");
const { registerCandidate } = require("../services/affordmedAuthService");
const { validateRegistrationPayload } = require("../validators/authValidators");

const register = asyncHandler(async (req, res) => {
  const payload = validateRegistrationPayload(req.body || {});
  const registrationResponse = await registerCandidate(payload);

  await appLogger.info(
    "auth",
    `client registration completed for rollNo=${payload.rollNo} requestId=${req.requestId}`,
  );

  res.status(201).json({
    success: true,
    data: registrationResponse,
  });
});

module.exports = {
  register,
};
