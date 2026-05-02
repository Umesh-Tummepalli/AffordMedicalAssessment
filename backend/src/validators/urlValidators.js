const AppError = require("../errors/AppError");

function validateUrl(value) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function validateCreateUrlPayload(body) {
  if (typeof body.originalUrl !== "string" || body.originalUrl.trim().length === 0) {
    throw new AppError(
      400,
      "originalUrl is required.",
      {
        field: "originalUrl",
      },
      "VALIDATION_ERROR",
    );
  }

  const originalUrl = body.originalUrl.trim();

  if (!validateUrl(originalUrl)) {
    throw new AppError(
      400,
      "originalUrl must be a valid http or https URL.",
      {
        field: "originalUrl",
      },
      "VALIDATION_ERROR",
    );
  }

  let customCode = null;
  if (body.customCode != null) {
    if (typeof body.customCode !== "string" || body.customCode.trim().length === 0) {
      throw new AppError(
        400,
        "customCode must be a non-empty string when provided.",
        {
          field: "customCode",
        },
        "VALIDATION_ERROR",
      );
    }

    customCode = body.customCode.trim();
    if (!/^[a-zA-Z0-9_-]{4,20}$/.test(customCode)) {
      throw new AppError(
        400,
        "customCode must be 4-20 characters and contain only letters, numbers, hyphen, or underscore.",
        {
          field: "customCode",
        },
        "VALIDATION_ERROR",
      );
    }
  }

  let expiryMinutes = null;
  if (body.expiryMinutes != null) {
    const parsedExpiry = Number.parseInt(body.expiryMinutes, 10);

    if (!Number.isInteger(parsedExpiry) || parsedExpiry < 1 || parsedExpiry > 525600) {
      throw new AppError(
        400,
        "expiryMinutes must be an integer between 1 and 525600.",
        {
          field: "expiryMinutes",
        },
        "VALIDATION_ERROR",
      );
    }

    expiryMinutes = parsedExpiry;
  }

  return {
    customCode,
    expiryMinutes,
    originalUrl,
  };
}

module.exports = {
  validateCreateUrlPayload,
};
