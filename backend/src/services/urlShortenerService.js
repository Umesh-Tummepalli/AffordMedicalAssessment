const crypto = require("crypto");

const AppError = require("../errors/AppError");

function generateShortCode(length = 7) {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

function isExpired(record, now = new Date()) {
  if (!record.expiresAt) {
    return false;
  }

  return new Date(record.expiresAt).getTime() <= now.getTime();
}

function buildStatus(record, now = new Date()) {
  return isExpired(record, now) ? "expired" : "active";
}

function createUrlShortenerService({
  repository,
  logger,
  now = () => new Date(),
  codeGenerator = () => generateShortCode(7),
}) {
  async function ensureUniqueCode(preferredCode = null) {
    if (preferredCode) {
      const existing = await repository.findByShortCode(preferredCode);
      if (existing) {
        throw new AppError(
          409,
          `Short code ${preferredCode} is already in use.`,
          null,
          "SHORT_CODE_CONFLICT",
        );
      }

      return preferredCode;
    }

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const generatedCode = codeGenerator();
      const existing = await repository.findByShortCode(generatedCode);

      if (!existing) {
        return generatedCode;
      }
    }

    throw new AppError(
      500,
      "Unable to generate a unique short code after multiple attempts.",
      null,
      "SHORT_CODE_GENERATION_FAILED",
    );
  }

  function toRecord(input) {
    const timestamp = now().toISOString();
    const expiresAt = input.expiryMinutes
      ? new Date(now().getTime() + input.expiryMinutes * 60 * 1000).toISOString()
      : null;

    return {
      id: crypto.randomUUID(),
      shortCode: input.shortCode,
      originalUrl: input.originalUrl,
      createdAt: timestamp,
      updatedAt: timestamp,
      expiresAt,
      accessCount: 0,
      lastAccessedAt: null,
    };
  }

  async function createShortUrl({ originalUrl, customCode, expiryMinutes }) {
    const shortCode = await ensureUniqueCode(customCode || null);
    const record = toRecord({
      originalUrl,
      shortCode,
      expiryMinutes,
    });

    const createdRecord = await repository.create(record);
    await logger.info(
      "utils",
      `url created shortCode=${createdRecord.shortCode} expiresAt=${createdRecord.expiresAt || "never"}`,
    );
    return createdRecord;
  }

  async function listShortUrls() {
    const records = await repository.listAll();
    const currentTime = now();

    return records
      .map((record) => ({
        ...record,
        status: buildStatus(record, currentTime),
      }))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async function getShortUrl(shortCode) {
    const record = await repository.findByShortCode(shortCode);

    if (!record) {
      throw new AppError(404, "Short URL not found.", null, "SHORT_URL_NOT_FOUND");
    }

    return {
      ...record,
      status: buildStatus(record, now()),
    };
  }

  async function resolveShortCode(shortCode) {
    const record = await repository.findByShortCode(shortCode);

    if (!record) {
      throw new AppError(404, "Short URL not found.", null, "SHORT_URL_NOT_FOUND");
    }

    if (isExpired(record, now())) {
      throw new AppError(410, "Short URL has expired.", null, "SHORT_URL_EXPIRED");
    }

    const resolvedRecord = await repository.updateByShortCode(shortCode, (current) => ({
      ...current,
      accessCount: current.accessCount + 1,
      lastAccessedAt: now().toISOString(),
      updatedAt: now().toISOString(),
    }));

    await logger.info(
      "utils",
      `short url resolved shortCode=${shortCode} accessCount=${resolvedRecord.accessCount}`,
    );

    return resolvedRecord;
  }

  async function deleteShortUrl(shortCode) {
    const deletedRecord = await repository.deleteByShortCode(shortCode);

    if (!deletedRecord) {
      throw new AppError(404, "Short URL not found.", null, "SHORT_URL_NOT_FOUND");
    }

    await logger.warn("utils", `short url deleted shortCode=${shortCode}`);
    return deletedRecord;
  }

  return {
    createShortUrl,
    deleteShortUrl,
    getShortUrl,
    listShortUrls,
    resolveShortCode,
  };
}

module.exports = {
  createUrlShortenerService,
};
