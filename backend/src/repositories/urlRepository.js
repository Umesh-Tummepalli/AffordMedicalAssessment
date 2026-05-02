const env = require("../config/env");
const {
  ensureJsonArrayFile,
  readJsonArrayFile,
  writeJsonArrayFile,
} = require("../utils/fileStore");

let mutationQueue = Promise.resolve();
let memoryCache = null;

async function loadCache() {
  if (!memoryCache) {
    memoryCache = await readJsonArrayFile(env.dataFilePath);
  }
}

async function ensureStore() {
  await ensureJsonArrayFile(env.dataFilePath);
  await loadCache();
}

async function listAll() {
  await mutationQueue.catch(() => {});
  await loadCache();
  return memoryCache;
}

function queueMutation(mutator) {
  const task = mutationQueue.then(async () => {
    await loadCache();
    const { nextRecords, value } = await mutator(memoryCache);
    memoryCache = nextRecords;
    
    // Asynchronously flush to disk (fire and forget to avoid blocking API)
    writeJsonArrayFile(env.dataFilePath, nextRecords).catch((err) => {
       console.error("Failed to async flush URL DB to disk:", err);
    });

    return value;
  });

  mutationQueue = task.catch(() => {});
  return task;
}

async function findByShortCode(shortCode) {
  const records = await listAll();
  return records.find((record) => record.shortCode === shortCode) || null;
}

async function create(record) {
  return queueMutation(async (records) => ({
    nextRecords: [...records, record],
    value: record,
  }));
}

async function updateByShortCode(shortCode, updater) {
  return queueMutation(async (records) => {
    const index = records.findIndex((record) => record.shortCode === shortCode);

    if (index === -1) {
      return {
        nextRecords: records,
        value: null,
      };
    }

    const updatedRecord = await updater({ ...records[index] });
    const nextRecords = [...records];
    nextRecords[index] = updatedRecord;

    return {
      nextRecords,
      value: updatedRecord,
    };
  });
}

async function deleteByShortCode(shortCode) {
  return queueMutation(async (records) => {
    const index = records.findIndex((record) => record.shortCode === shortCode);

    if (index === -1) {
      return {
        nextRecords: records,
        value: null,
      };
    }

    const deletedRecord = records[index];
    const nextRecords = records.filter((record) => record.shortCode !== shortCode);

    return {
      nextRecords,
      value: deletedRecord,
    };
  });
}

module.exports = {
  create,
  deleteByShortCode,
  ensureStore,
  findByShortCode,
  listAll,
  updateByShortCode,
};
