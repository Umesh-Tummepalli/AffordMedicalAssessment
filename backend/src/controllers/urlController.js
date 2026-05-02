const asyncHandler = require("../middleware/asyncHandler");
const urlRepository = require("../repositories/urlRepository");
const appLogger = require("../services/logService");
const { createUrlShortenerService } = require("../services/urlShortenerService");
const { validateCreateUrlPayload } = require("../validators/urlValidators");

const urlService = createUrlShortenerService({
  repository: urlRepository,
  logger: appLogger,
});

function buildPublicBaseUrl(req) {
  return req.app.get("publicBaseUrl") || `${req.protocol}://${req.get("host")}`;
}

function serializeUrlRecord(req, record) {
  return {
    id: record.id,
    shortCode: record.shortCode,
    shortUrl: `${buildPublicBaseUrl(req)}/r/${record.shortCode}`,
    originalUrl: record.originalUrl,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    expiresAt: record.expiresAt,
    accessCount: record.accessCount,
    lastAccessedAt: record.lastAccessedAt,
    status: record.status || "active",
  };
}

const createShortUrl = asyncHandler(async (req, res) => {
  const payload = validateCreateUrlPayload(req.body || {});

  await appLogger.info(
    "utils",
    `create short url request received requestId=${req.requestId}`,
  );

  const createdRecord = await urlService.createShortUrl(payload);

  res.status(201).json({
    success: true,
    data: serializeUrlRecord(req, createdRecord),
  });
});

const listShortUrls = asyncHandler(async (req, res) => {
  const records = await urlService.listShortUrls();

  await appLogger.info(
    "utils",
    `list short urls request completed count=${records.length} requestId=${req.requestId}`,
  );

  res.status(200).json({
    success: true,
    data: {
      count: records.length,
      items: records.map((record) => serializeUrlRecord(req, record)),
    },
  });
});

const getShortUrl = asyncHandler(async (req, res) => {
  const record = await urlService.getShortUrl(req.params.shortCode);

  await appLogger.info(
    "utils",
    `short url details fetched shortCode=${req.params.shortCode} requestId=${req.requestId}`,
  );

  res.status(200).json({
    success: true,
    data: serializeUrlRecord(req, record),
  });
});

const getShortUrlStats = asyncHandler(async (req, res) => {
  const record = await urlService.getShortUrl(req.params.shortCode);

  await appLogger.info(
    "utils",
    `short url stats fetched shortCode=${req.params.shortCode} requestId=${req.requestId}`,
  );

  res.status(200).json({
    success: true,
    data: {
      shortCode: record.shortCode,
      originalUrl: record.originalUrl,
      accessCount: record.accessCount,
      lastAccessedAt: record.lastAccessedAt,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
      status: record.status,
    },
  });
});

const deleteShortUrl = asyncHandler(async (req, res) => {
  const record = await urlService.deleteShortUrl(req.params.shortCode);

  await appLogger.warn(
    "utils",
    `short url removed shortCode=${record.shortCode} requestId=${req.requestId}`,
  );

  res.status(200).json({
    success: true,
    data: serializeUrlRecord(req, {
      ...record,
      status: "deleted",
    }),
  });
});

const redirectToOriginalUrl = asyncHandler(async (req, res) => {
  const record = await urlService.resolveShortCode(req.params.shortCode);

  await appLogger.info(
    "utils",
    `redirecting short code=${record.shortCode} requestId=${req.requestId}`,
  );

  res.redirect(302, record.originalUrl);
});

module.exports = {
  createShortUrl,
  deleteShortUrl,
  getShortUrl,
  getShortUrlStats,
  listShortUrls,
  redirectToOriginalUrl,
};
