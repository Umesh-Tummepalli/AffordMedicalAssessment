let cachedCredentials = null;
let cachedToken = null;

function setCredentials(credentials) {
  cachedCredentials = {
    email: credentials.email,
    name: credentials.name,
    rollNo: credentials.rollNo,
    clientID: credentials.clientID,
    clientSecret: credentials.clientSecret,
  };
}

function getCredentials() {
  return cachedCredentials;
}

function setToken(tokenState) {
  cachedToken = {
    accessToken: tokenState.accessToken,
    tokenType: tokenState.tokenType || "Bearer",
    expiresAt: tokenState.expiresAt || null,
    issuedAt: tokenState.issuedAt || new Date().toISOString(),
  };
}

function getToken() {
  return cachedToken;
}

function clearToken() {
  cachedToken = null;
}

module.exports = {
  clearToken,
  getCredentials,
  getToken,
  setCredentials,
  setToken,
};
