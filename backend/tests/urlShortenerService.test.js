const test = require("node:test");
const assert = require("node:assert/strict");

const { createUrlShortenerService } = require("../src/services/urlShortenerService");

function createInMemoryRepository() {
  const records = [];

  return {
    async create(record) {
      records.push(record);
      return record;
    },
    async deleteByShortCode(shortCode) {
      const index = records.findIndex((record) => record.shortCode === shortCode);
      if (index === -1) {
        return null;
      }

      const [deleted] = records.splice(index, 1);
      return deleted;
    },
    async findByShortCode(shortCode) {
      return records.find((record) => record.shortCode === shortCode) || null;
    },
    async listAll() {
      return [...records];
    },
    async updateByShortCode(shortCode, updater) {
      const index = records.findIndex((record) => record.shortCode === shortCode);
      if (index === -1) {
        return null;
      }

      records[index] = await updater({ ...records[index] });
      return records[index];
    },
  };
}

function createLoggerStub() {
  return {
    async info() {},
    async warn() {},
  };
}

test("createShortUrl persists a record and honors a custom code", async () => {
  const service = createUrlShortenerService({
    repository: createInMemoryRepository(),
    logger: createLoggerStub(),
    now: () => new Date("2026-01-01T00:00:00.000Z"),
  });

  const record = await service.createShortUrl({
    originalUrl: "https://example.com/docs",
    customCode: "docs2026",
    expiryMinutes: 60,
  });

  assert.equal(record.shortCode, "docs2026");
  assert.equal(record.originalUrl, "https://example.com/docs");
  assert.equal(record.accessCount, 0);
  assert.equal(record.expiresAt, "2026-01-01T01:00:00.000Z");
});

test("resolveShortCode increments access count and updates lastAccessedAt", async () => {
  const repository = createInMemoryRepository();
  const timestamps = [
    new Date("2026-01-01T00:00:00.000Z"),
    new Date("2026-01-01T00:01:00.000Z"),
    new Date("2026-01-01T00:01:00.000Z"),
  ];
  let index = 0;

  const service = createUrlShortenerService({
    repository,
    logger: createLoggerStub(),
    now: () => timestamps[Math.min(index++, timestamps.length - 1)],
  });

  await service.createShortUrl({
    originalUrl: "https://example.com/start",
    customCode: "start01",
  });

  const resolved = await service.resolveShortCode("start01");

  assert.equal(resolved.accessCount, 1);
  assert.equal(resolved.lastAccessedAt, "2026-01-01T00:01:00.000Z");
});

test("deleteShortUrl removes an existing record", async () => {
  const repository = createInMemoryRepository();
  const service = createUrlShortenerService({
    repository,
    logger: createLoggerStub(),
    now: () => new Date("2026-01-01T00:00:00.000Z"),
  });

  await service.createShortUrl({
    originalUrl: "https://example.com/delete-me",
    customCode: "deleteme",
  });

  const deleted = await service.deleteShortUrl("deleteme");
  const remaining = await repository.findByShortCode("deleteme");

  assert.equal(deleted.shortCode, "deleteme");
  assert.equal(remaining, null);
});
