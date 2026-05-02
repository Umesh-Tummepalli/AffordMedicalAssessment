const fs = require("fs/promises");
const path = require("path");

async function ensureJsonArrayFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  try {
    await fs.access(filePath);
  } catch (error) {
    await fs.writeFile(filePath, "[]\n", "utf8");
  }
}

async function readJsonArrayFile(filePath) {
  await ensureJsonArrayFile(filePath);
  const raw = await fs.readFile(filePath, "utf8");
  if (!raw.trim()) {
    return [];
  }

  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeJsonArrayFile(filePath, records) {
  await ensureJsonArrayFile(filePath);
  await fs.writeFile(filePath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

module.exports = {
  ensureJsonArrayFile,
  readJsonArrayFile,
  writeJsonArrayFile,
};
