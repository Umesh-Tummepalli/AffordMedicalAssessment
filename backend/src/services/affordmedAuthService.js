const axios = require("axios");

const env = require("../config/env");
const AppError = require("../errors/AppError");
const runtimeAuthStore = require("../state/runtimeAuthStore");

const affordmedClient = axios.create({
  baseURL: env.affordmedBaseUrl,
  timeout: env.httpTimeoutMs,
  headers: {
    "Content-Type": "application/json",
  },
});

function isPopulated(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeCredentials(candidate = {}) {
  return {
    email: candidate.email?.trim() || "",
    name: candidate.name?.trim() || "",
    rollNo: candidate.rollNo?.trim() || "",
    clientID: candidate.clientID?.trim() || "",
    clientSecret: candidate.clientSecret?.trim() || "",
  };
}

function areCredentialsComplete(candidate) {
  return (
    isPopulated(candidate.email) &&
    isPopulated(candidate.name) &&
    isPopulated(candidate.rollNo) &&
    isPopulated(candidate.clientID) &&
    isPopulated(candidate.clientSecret)
  );
}

function resolveCredentials(overrideCredentials = null) {
  const merged = normalizeCredentials({
    ...env.defaultCredentials,
    ...(runtimeAuthStore.getCredentials() || {}),
    ...(overrideCredentials || {}),
  });

  if (!areCredentialsComplete(merged)) {
    throw new AppError(
      503,
      "AffordMed credentials are not configured. Register first or configure AFFORDMED_* environment variables.",
      {
        missingFields: Object.entries(merged)
          .filter(([, value]) => !isPopulated(value))
          .map(([key]) => key),
      },
      "AFFORDMED_CREDENTIALS_MISSING",
    );
  }

  return merged;
}

function parseExpiryTimestamp(rawValue) {
  if (!rawValue) {
    return null;
  }

  if (typeof rawValue === "number") {
    return new Date(rawValue).toISOString();
  }

  const parsed = new Date(rawValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function buildTokenState(responseData) {
  const accessToken =
    responseData.access_token || responseData.accessToken || null;
  const tokenType =
    responseData.token_type || responseData.tokenType || "Bearer";
  const expiresAt =
    parseExpiryTimestamp(responseData.expires_at) ||
    parseExpiryTimestamp(responseData.expiresAt) ||
    new Date(
      Date.now() +
        (Number(responseData.expires_in || responseData.expiresIn) ||
          env.tokenTtlSecondsFallback) *
          1000,
    ).toISOString();

  if (!isPopulated(accessToken)) {
    throw new AppError(
      502,
      "AffordMed auth response did not include an access token.",
      responseData,
      "AFFORDMED_TOKEN_INVALID",
    );
  }

  return {
    accessToken,
    tokenType,
    expiresAt,
    issuedAt: new Date().toISOString(),
  };
}

function normalizeExternalError(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    const statusCode =
      error.response?.status && error.response.status < 500
        ? error.response.status
        : 502;
    const responseData = error.response?.data || null;
    const message =
      responseData?.message ||
      responseData?.error ||
      error.message ||
      fallbackMessage;

    throw new AppError(
      statusCode,
      message,
      responseData,
      "AFFORDMED_UPSTREAM_ERROR",
    );
  }

  throw error;
}

function isTokenExpired(tokenState) {
  if (!tokenState?.expiresAt) {
    return false;
  }

  return new Date(tokenState.expiresAt).getTime() <= Date.now();
}

async function registerCandidate(payload) {
  try {
    const response = await affordmedClient.post("/register", payload);

    const credentials = normalizeCredentials({
      email: payload.email,
      name: payload.name,
      rollNo: payload.rollNo,
      clientID: response.data.clientID || response.data.clientId,
      clientSecret: response.data.clientSecret,
    });

    if (areCredentialsComplete(credentials)) {
      runtimeAuthStore.setCredentials(credentials);
    }

    return response.data;
  } catch (error) {
    normalizeExternalError(error, "AffordMed registration failed.");
  }
}

async function authenticateCandidate(payload) {
  const credentials = resolveCredentials(payload);
  runtimeAuthStore.setCredentials(credentials);

  try {
    const response = await affordmedClient.post("/auth", credentials);
    const tokenState = buildTokenState(response.data);
    runtimeAuthStore.setToken(tokenState);
    return tokenState;
  } catch (error) {
    runtimeAuthStore.clearToken();
    normalizeExternalError(error, "AffordMed authentication failed.");
  }
}

let authPromise = null;

async function getValidAccessToken(options = {}) {
  const { forceRefresh = false, credentials = null } = options;
  const cachedToken = runtimeAuthStore.getToken();

  if (!forceRefresh && cachedToken && !isTokenExpired(cachedToken)) {
    return cachedToken;
  }

  if (authPromise) {
    return authPromise;
  }

  authPromise = authenticateCandidate(credentials).finally(() => {
    authPromise = null;
  });

  return authPromise;
}

async function ensureAuthorizedToken(accessToken) {
  if (!isPopulated(accessToken)) {
    throw new AppError(401, "Missing bearer token.", null, "TOKEN_MISSING");
  }

  const activeToken = await getValidAccessToken();

  if (isTokenExpired(activeToken)) {
    throw new AppError(401, "Access token has expired.", null, "TOKEN_EXPIRED");
  }

  if (activeToken.accessToken !== accessToken.trim()) {
    throw new AppError(
      401,
      "Provided bearer token does not match the active access token.",
      null,
      "TOKEN_MISMATCH",
    );
  }

  return activeToken;
}

module.exports = {
  authenticateCandidate,
  ensureAuthorizedToken,
  getValidAccessToken,
  registerCandidate,
};
