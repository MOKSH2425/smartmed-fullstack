const fs = require("fs/promises");
const path = require("path");
const { env } = require("../config/env");

const collectionFiles = {
  users: "users.json",
  doctors: "doctors.json",
  appointments: "appointments.json",
  reports: "reports.json",
  symptoms: "symptoms.json",
};

const writeQueues = new Map();

const getCollectionPath = (name) => {
  const fileName = collectionFiles[name];

  if (!fileName) {
    throw new Error(`Unknown collection: ${name}`);
  }

  return path.join(env.dataDir, fileName);
};

const ensureDataFiles = async () => {
  await fs.mkdir(env.dataDir, { recursive: true });

  await Promise.all(
    Object.keys(collectionFiles).map(async (name) => {
      const filePath = getCollectionPath(name);

      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, "[]\n", "utf8");
      }
    })
  );
};

const readCollection = async (name) => {
  const filePath = getCollectionPath(name);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw || "[]");
  return Array.isArray(parsed) ? parsed : [];
};

const writeCollection = async (name, items) => {
  const filePath = getCollectionPath(name);
  await fs.writeFile(filePath, `${JSON.stringify(items, null, 2)}\n`, "utf8");
  return items;
};

const updateCollection = async (name, updater) => {
  const previous = writeQueues.get(name) || Promise.resolve();
  const next = previous.then(async () => {
    const currentItems = await readCollection(name);
    const nextItems = await updater(currentItems);
    return writeCollection(name, nextItems);
  });

  writeQueues.set(
    name,
    next.catch(() => {})
  );

  return next;
};

module.exports = {
  ensureDataFiles,
  readCollection,
  writeCollection,
  updateCollection,
  getCollectionPath,
};
