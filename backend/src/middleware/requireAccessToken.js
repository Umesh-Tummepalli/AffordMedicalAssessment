const AppError = require("../errors/AppError");
const { ensureAuthorizedToken } = require("../services/affordmedAuthService");

async function requireAccessToken(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization || "";

    if (!authorizationHeader.startsWith("Bearer ")) {
      throw new AppError(
        401,
        "Authorization header must be in the format Bearer <token>.",
        null,
        "AUTH_HEADER_INVALID",
      );
    }

    const accessToken = authorizationHeader.slice("Bearer ".length).trim();
    await ensureAuthorizedToken(accessToken);
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireAccessToken;
