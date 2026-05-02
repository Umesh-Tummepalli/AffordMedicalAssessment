const AppError = require("../errors/AppError");

function requireTrimmedString(source, fieldName, label) {
  const value = source[fieldName];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(
      400,
      `${label} is required.`,
      {
        field: fieldName,
      },
      "VALIDATION_ERROR",
    );
  }

  return value.trim();
}

function validateRegistrationPayload(body) {
  return {
    email: requireTrimmedString(body, "email", "Email"),
    name: requireTrimmedString(body, "name", "Name"),
    mobileNo: requireTrimmedString(body, "mobileNo", "Mobile number"),
    githubUsername: requireTrimmedString(
      body,
      "githubUsername",
      "GitHub username",
    ),
    rollNo: requireTrimmedString(body, "rollNo", "Roll number"),
    accessCode: requireTrimmedString(body, "accessCode", "Access code"),
  };
}

function validateAuthPayload(body) {
  return {
    email: requireTrimmedString(body, "email", "Email"),
    name: requireTrimmedString(body, "name", "Name"),
    rollNo: requireTrimmedString(body, "rollNo", "Roll number"),
    clientID: requireTrimmedString(body, "clientID", "Client ID"),
    clientSecret: requireTrimmedString(body, "clientSecret", "Client secret"),
  };
}

module.exports = {
  validateAuthPayload,
  validateRegistrationPayload,
};
